package com.shifa.integration.payment;

import com.shifa.integration.payment.exception.PaymentException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final RazorpayClient razorpayClient;

    public void processWebhook(String payload, String signature) {
        // Implementation for webhook processing (e.g. updating DB records for subscription)
        log.debug("Processing Razorpay webhook payload");
    }
}
