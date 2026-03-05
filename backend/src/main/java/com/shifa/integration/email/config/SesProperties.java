package com.shifa.integration.email.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.ses")
@Data
@Validated
public class SesProperties {
    @NotBlank private String region;
    @NotBlank private String fromAddress;
    @NotBlank private String fromName;
    private String replyTo;
    private String configurationSet;
}
