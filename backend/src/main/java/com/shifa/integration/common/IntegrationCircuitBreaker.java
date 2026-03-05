package com.shifa.integration.common;

import com.shifa.integration.ai.exception.AIIntegrationException;
import com.shifa.integration.ai.exception.AIParsingException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Configuration
public class IntegrationCircuitBreaker {

    @Bean
    public CircuitBreaker claudeCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig cfg = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .minimumNumberOfCalls(5)
            .waitDurationInOpenState(Duration.ofSeconds(30))
            .permittedNumberOfCallsInHalfOpenState(2)
            .recordExceptions(AIIntegrationException.class, TimeoutException.class)
            .ignoreExceptions(AIParsingException.class)
            .build();
        return registry.circuitBreaker("claude", cfg);
    }

    @Bean
    public CircuitBreaker whatsAppCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig cfg = CircuitBreakerConfig.custom()
            .failureRateThreshold(30)
            .minimumNumberOfCalls(10)
            .waitDurationInOpenState(Duration.ofMinutes(2))
            .build();
        return registry.circuitBreaker("whatsapp", cfg);
    }
}
