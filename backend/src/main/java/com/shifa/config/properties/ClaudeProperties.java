package com.shifa.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration("configClaudeProperties")
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

    public int getRetryInitialDelayMs() {
        return retryInitialDelayMs;
    }

    public void setRetryInitialDelayMs(int retryInitialDelayMs) {
        this.retryInitialDelayMs = retryInitialDelayMs;
    }

    public int getRateLimitPerDoctorPerDay() {
        return rateLimitPerDoctorPerDay;
    }

    public void setRateLimitPerDoctorPerDay(int rateLimitPerDoctorPerDay) {
        this.rateLimitPerDoctorPerDay = rateLimitPerDoctorPerDay;
    }
}
