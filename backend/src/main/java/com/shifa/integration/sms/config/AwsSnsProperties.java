package com.shifa.integration.sms.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.aws-sns")
@Data
@Validated
public class AwsSnsProperties {
    @NotBlank private String region;
    private String smsType = "Transactional";
}
