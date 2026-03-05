package com.shifa.integration.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.razorpay")
@Data
@Validated
public class RazorpayProperties {
    private boolean enabled = false;
    private String keyId;
    private String keySecret;
    private String currency = "INR";
    private String webhookSecret;
}
