package com.shifa.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = 'security')
public class ShifaProperties {
    private JwtProperties jwt = new JwtProperties();

    @Data
    @Configuration
    @ConfigurationProperties(prefix = 'security.jwt')
    public static class JwtProperties {
        private String secret;
        private long expiryMs;
        private long refreshExpiryMs;
        public long getExpirationMs() { return expiryMs; }
        public long getRefreshExpirationMs() { return refreshExpiryMs; }
    }
}
