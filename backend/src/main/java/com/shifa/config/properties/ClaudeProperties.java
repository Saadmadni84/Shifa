package com.shifa.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "integration.claude")
public class ClaudeProperties {
    private String apiKey;
    private String baseUrl;
    private String model;
    private int maxTokens;
    private int timeoutSeconds;
    private int retryMaxAttempts;
    private int retryInitialDelayMs;
    private int rateLimitPerDoctorPerDay;
}
