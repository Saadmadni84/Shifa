package com.shifa.domain.notification;

import com.shifa.common.pagination.PageResponse;
import com.shifa.common.enums.NotificationStatus;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.domain.notification.dto.NotificationResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final VisitRepository visitRepository;

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getNotifications(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        Page<Notification> data = notificationRepository.findAll(PageRequest.of(page, size));
        Page<NotificationResponse> mapped = data.map(n -> NotificationResponse.builder()
                .id(String.valueOf(n.getId()))
                .patientId(n.getPatientId() != null ? n.getPatientId().toString() : null)
                .doctorId(n.getVisit() != null && n.getVisit().getDoctor() != null ? String.valueOf(n.getVisit().getDoctor().getId()) : null)
                .type(n.getTypeCode())
                .channel(n.getChannel() != null ? n.getChannel().name() : null)
                .recipient(n.getRecipientPhone())
                .status(n.getStatusCode())
                .scheduledFor(n.getScheduledFor())
                .sentAt(n.getSentAt())
                .deliveredAt(n.getDeliveredAt())
                .readAt(n.getReadAt())
                .errorMessage(n.getErrorMessage())
                .retryCount(n.getRetryCount())
                .createdAt(n.getCreatedAt())
                .build());
        return ResponseEntity.ok(PageResponse.of(mapped));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable UUID id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        n.setStatus(NotificationStatus.READ);
        n.setReadAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(n);
        return ResponseEntity.ok(NotificationResponse.builder()
                .id(String.valueOf(saved.getId()))
                .patientId(saved.getPatientId() != null ? saved.getPatientId().toString() : null)
                .status(saved.getStatusCode())
                .readAt(saved.getReadAt())
                .build());
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllRead() {
        var pending = notificationRepository.findAll().stream()
                .filter(n -> n.getStatus() != NotificationStatus.READ)
                .collect(Collectors.toList());
        pending.forEach(n -> {
            n.setStatus(NotificationStatus.READ);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(pending);
        return ResponseEntity.ok(Map.of("updated", pending.size()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        long count = notificationRepository.findAll().stream()
                .filter(n -> n.getStatus() != NotificationStatus.READ)
                .count();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/visits/{visitId}/whatsapp-status")
    public ResponseEntity<Map<String, String>> whatsappStatus(@PathVariable UUID visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
        return ResponseEntity.ok(Map.of("status", visit.getWhatsappDeliveryStatus() == null ? "NOT_SENT" : visit.getWhatsappDeliveryStatus()));
    }

    @PostMapping("/visits/{visitId}/whatsapp-retry")
    public ResponseEntity<Map<String, String>> retryWhatsapp(@PathVariable UUID visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
        visit.setWhatsappStatus(com.shifa.common.enums.WhatsAppStatus.QUEUED);
        visitRepository.save(visit);
        return ResponseEntity.ok(Map.of("status", "RETRY_QUEUED"));
    }
}
