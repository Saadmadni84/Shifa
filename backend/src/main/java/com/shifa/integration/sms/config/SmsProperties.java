package com.shifa.integration.sms.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.sms")
@Data
@Validated
public class SmsProperties {
    @NotBlank private String provider;
    private String fallbackProvider;
    @NotBlank private String senderId;
}
