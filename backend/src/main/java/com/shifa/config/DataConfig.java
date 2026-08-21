package com.shifa.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@Configuration
@EnableJpaRepositories(basePackages = {
    "com.shifa.config.security",
    "com.shifa.domain.doctor",
    "com.shifa.domain.patient",
    "com.shifa.domain.prescription",
    "com.shifa.domain.reminder",
    "com.shifa.domain.user",
    "com.shifa.domain.visit", 
    "com.shifa.repository",
    "com.shifa.integration.whatsapp"
})
@EnableRedisRepositories(basePackages = {
    "com.shifa.domain.chat",
    "com.shifa.domain.consent",
    "com.shifa.domain.document",
    "com.shifa.domain.notification"
})
public class DataConfig {
}
