package com.shifa.integration.whatsapp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.common.enums.WhatsAppStatus;
import com.shifa.domain.notification.NotificationRepository;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.integration.whatsapp.config.WhatsAppProperties;
import com.shifa.integration.whatsapp.dto.WhatsAppIncomingMessageEvent;
import com.shifa.integration.whatsapp.dto.WhatsAppWebhookEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/webhooks/whatsapp")
@Slf4j
@RequiredArgsConstructor
public class WhatsAppWebhookController {

    private final WhatsAppProperties props;
    private final WhatsAppWebhookVerifier verifier;
    private final VisitRepository visitRepository;
    private final NotificationRepository notificationRepository;
    private final ApplicationEventPublisher eventPublisher;

    @GetMapping
    public ResponseEntity<String> verify(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {
        if ("subscribe".equals(mode) && props.getVerifyToken().equals(token)) {
            log.info("[WhatsApp] Webhook verified by Meta");
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping
    public ResponseEntity<Void> handle(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String sig) {

        if (!verifier.isValidSignature(rawPayload, sig)) {
            log.warn("[WhatsApp] Signature check failed — ignoring");
            return ResponseEntity.ok().build(); // Always 200 to prevent Meta retry storm
        }

        try {
            WhatsAppWebhookEvent event = new ObjectMapper().readValue(rawPayload, WhatsAppWebhookEvent.class);
            processEvent(event);
        } catch (Exception e) {
            log.error("[WhatsApp] Webhook processing error (still returning 200)", e);
        }

        return ResponseEntity.ok().build();
    }

    private void processEvent(WhatsAppWebhookEvent event) {
        if (event.getEntry() == null) return;
        for (var entry : event.getEntry()) {
            if (entry.getChanges() == null) continue;
            for (var change : entry.getChanges()) {
                var value = change.getValue();
                if (value == null) continue;
                if (value.getStatuses() != null)
                    value.getStatuses().forEach(this::processStatus);
                if (value.getMessages() != null)
                    value.getMessages().forEach(this::processIncoming);
            }
        }
    }

    private void processStatus(WhatsAppWebhookEvent.MessageStatus s) {
        WhatsAppStatus status = switch (s.getStatus()) {
            case "sent"      -> WhatsAppStatus.SENT;
            case "delivered" -> WhatsAppStatus.DELIVERED;
            case "read"      -> WhatsAppStatus.READ;
            case "failed"    -> WhatsAppStatus.FAILED;
            default          -> null;
        };
        if (status == null || s.getId() == null) return;

        visitRepository.updateWhatsAppStatus(s.getId(), status);
        notificationRepository.updateStatusByExternalId(s.getId(), status.name());
        log.info("[WhatsApp] Status: id={}, status={}", s.getId(), status);
    }

    private void processIncoming(WhatsAppWebhookEvent.IncomingMessage msg) {
        log.info("[WhatsApp] Incoming from={}, type={}", msg.getFrom(), msg.getType());
        eventPublisher.publishEvent(new WhatsAppIncomingMessageEvent(
            this, msg.getFrom(), msg.getType(),
            msg.getText() != null ? msg.getText().getBody() : null
        ));
    }
}
