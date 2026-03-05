package com.shifa.security.jwt;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "security.jwt")
public class JwtProperties {

    private String secret;

    private long expiryMs = 900_000L;

    private long refreshExpiryMs = 604_800_000L;
}
