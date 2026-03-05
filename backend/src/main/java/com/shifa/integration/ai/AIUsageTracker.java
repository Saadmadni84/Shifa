package com.shifa.integration.ai;

import com.shifa.integration.ai.config.ClaudeProperties;
import com.shifa.integration.ai.exception.AIRateLimitException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class AIUsageTracker {

    private final RedisTemplate<String, String> redis;
    private final ClaudeProperties props;

    private static final String PREFIX = "ai:usage:";

    public void checkAndRecord(UUID actorId, String operationType) {
        String key = PREFIX + actorId + ":" + LocalDate.now();
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) redis.expire(key, Duration.ofDays(1));

        log.debug("[AI] Usage: actorId={}, type={}, dailyCount={}", actorId, operationType, count);

        if (count != null && count > props.getRateLimitPerDoctorPerDay()) {
            throw new AIRateLimitException(
                "Daily AI limit of " + props.getRateLimitPerDoctorPerDay() +
                " exceeded for: " + actorId);
        }
    }

    public long getDailyUsage(UUID actorId) {
        String val = redis.opsForValue().get(PREFIX + actorId + ":" + LocalDate.now());
        return val != null ? Long.parseLong(val) : 0;
    }
}
