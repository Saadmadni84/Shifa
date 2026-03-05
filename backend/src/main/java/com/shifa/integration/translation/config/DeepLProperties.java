package com.shifa.integration.translation.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.deepl")
@Data
@Validated
public class DeepLProperties {
    private boolean enabled = false;
    private String apiKey;
    private String baseUrl;
    private int cacheTtlHours = 168;
}
