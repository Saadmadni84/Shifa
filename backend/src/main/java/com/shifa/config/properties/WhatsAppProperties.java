package com.shifa.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "integration.whatsapp")
public class WhatsAppProperties {
    private String token;
    private String baseUrl = "https://graph.facebook.com/v19.0";
}
