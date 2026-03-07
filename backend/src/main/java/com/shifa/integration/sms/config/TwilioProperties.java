package com.shifa.integration.sms.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.twilio")
@Component
@Data
@Validated
public class TwilioProperties {
    @NotBlank private String accountSid;
    @NotBlank private String authToken;
    @NotBlank private String fromNumber;
    @NotBlank private String baseUrl;
}
