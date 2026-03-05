package com.shifa.integration.common;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class IntegrationHealthIndicator implements HealthIndicator {

    private final CircuitBreakerRegistry cbRegistry;
    private final RedisTemplate<String, String> redis;

    @Override
    public Health health() {
        Health.Builder b = Health.up();

        // Claude circuit state
        try {
            var state = cbRegistry.circuitBreaker("claude").getState();
            b.withDetail("claude_circuit", state.name());
            if (state == CircuitBreaker.State.OPEN) b.down().withDetail("alert", "Claude circuit OPEN");
        } catch (Exception e) { b.withDetail("claude_circuit", "UNKNOWN"); }

        // WhatsApp circuit state
        try {
            b.withDetail("whatsapp_circuit",
                cbRegistry.circuitBreaker("whatsapp").getState().name());
        } catch (Exception e) { b.withDetail("whatsapp_circuit", "UNKNOWN"); }

        // Redis ping
        try {
            redis.opsForValue().get("health:ping");
            b.withDetail("redis", "UP");
        } catch (Exception e) { b.withDetail("redis", "DOWN: " + e.getMessage()); }

        return b.build();
    }
}
