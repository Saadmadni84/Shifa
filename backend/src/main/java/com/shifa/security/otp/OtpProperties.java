package com.shifa.security.otp;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "security.otp")
public class OtpProperties {
    private int ttlMinutes = 5;
    private int maxAttempts = 5;
    private int lockoutMinutes = 15;
    private int resendCooldownSec = 60;
}
