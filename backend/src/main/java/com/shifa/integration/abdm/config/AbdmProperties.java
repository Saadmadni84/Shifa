package com.shifa.integration.abdm.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.abdm")
@Data
@Validated
public class AbdmProperties {
    private boolean enabled = false;
    private String baseUrl;
    private String clientId;
    private String clientSecret;
    private String hipId;
    private int tokenRefreshBufferSeconds = 60;
}
