package com.shifa.integration.fcm.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.fcm")
@Data
@Validated
public class FcmProperties {
    private boolean enabled = false;
    private String serviceAccountJson;
    private String projectId;
}
