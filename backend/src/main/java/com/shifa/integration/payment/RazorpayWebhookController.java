package com.shifa.integration.payment;

import com.shifa.integration.payment.exception.PaymentException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks/razorpay")
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "integration.razorpay.enabled", havingValue = "true")
public class RazorpayWebhookController {

    private final RazorpayClient razorpayClient;
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        // For Razorpay, webhook verification typically uses a separate webhook secret
        // but for simplicity, we mock the flow. In a real app, verify signature here.
        log.info("[Razorpay] Webhook received");
        try {
            paymentService.processWebhook(payload, signature);
            return ResponseEntity.ok().build();
        } catch (PaymentException e) {
            log.error("[Razorpay] Webhook processing failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
