package com.shifa.integration.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@ConfigurationProperties(prefix = "integration.claude")
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

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(int maxTokens) {
        this.maxTokens = maxTokens;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public int getRetryMaxAttempts() {
        return retryMaxAttempts;
    }

    public void setRetryMaxAttempts(int retryMaxAttempts) {
        this.retryMaxAttempts = retryMaxAttempts;
    }

    public long getRetryInitialDelayMs() {
        return retryInitialDelayMs;
    }

    public void setRetryInitialDelayMs(long retryInitialDelayMs) {
        this.retryInitialDelayMs = retryInitialDelayMs;
    }

    public int getRateLimitPerDoctorPerDay() {
        return rateLimitPerDoctorPerDay;
    }

    public void setRateLimitPerDoctorPerDay(int rateLimitPerDoctorPerDay) {
        this.rateLimitPerDoctorPerDay = rateLimitPerDoctorPerDay;
    }
}
