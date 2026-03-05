package com.shifa.integration.ai.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.claude")
@Data
@Validated
public class ClaudeProperties {

    @NotBlank private String apiKey;
    @NotBlank private String baseUrl;
    @NotBlank private String model;

    @Min(256) @Max(8192)
    private int maxTokens = 4096;

    @Min(10) @Max(120)
    private int timeoutSeconds = 60;

    @Min(1) @Max(5)
    private int retryMaxAttempts = 3;

    @Min(500) @Max(30000)
    private long retryInitialDelayMs = 2000;

    @Min(10)
    private int rateLimitPerDoctorPerDay = 200;
}
