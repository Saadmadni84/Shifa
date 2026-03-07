package com.shifa.integration.whatsapp.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.whatsapp")
@Component
@Data
@Validated
public class WhatsAppProperties {
    @NotBlank private String token;
    @NotBlank private String phoneNumberId;
    @NotBlank private String wabaId;
    @NotBlank private String verifyToken;
    @NotBlank private String baseUrl;
    private int timeoutSeconds = 30;
    private int maxMessageLength = 4096;
    private int retryMaxAttempts = 3;
    private long retryDelayMs = 5000;
}
