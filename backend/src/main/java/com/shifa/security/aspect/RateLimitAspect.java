package com.shifa.security.aspect;

import com.shifa.security.annotation.RateLimited;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;

@Aspect
@Component("securityRateLimitAspect")
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

    private final StringRedisTemplate redisTemplate;

    @Around("@annotation(rateLimited)")
    public Object enforce(ProceedingJoinPoint pjp, RateLimited rateLimited) throws Throwable {
        String userId = resolveUserId();
        String window = resolveWindow(rateLimited.per());
        String key = "shifa:ratelimit:" + rateLimited.key() + ":" + userId + ":" + window;

        // Retrieve current count from Redis
        String currentCountStr = redisTemplate.opsForValue().get(key);
        Long currentCount = (currentCountStr != null) ? Long.valueOf(currentCountStr) : null;

        // If currentCount is not null and already exceeds or meets the limit, reject
        if (currentCount != null && currentCount >= rateLimited.limit()) {
            log.warn("[RateLimit] EXCEEDED key={} userId={} count={}", rateLimited.key(), userId, currentCount);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Rate limit exceeded for " + rateLimited.key() +
                            ". Limit: " + rateLimited.limit() + " per " + rateLimited.per().toLowerCase() + ".");
        }

        // Determine TTL for the key
        Duration ttl = switch (rateLimited.per()) {
            case "HOUR" -> Duration.ofHours(1);
            case "MINUTE" -> Duration.ofMinutes(1);
            default -> Duration.ofDays(1);
        };

        // If it's the first request in the window, set the count to 1 with TTL
        if (currentCount == null) {
            redisTemplate.opsForValue().set(key, "1", ttl);
        } else {
            // Otherwise, increment the count. Redis increment will also update the TTL if
            // it exists.
            // However, to ensure the TTL is always reset/maintained for the window, we
            // explicitly set it.
            redisTemplate.opsForValue().increment(key);
            redisTemplate.expire(key, ttl); // Re-set expiry to ensure it aligns with the window
        }

        // Re-check the count after incrementing (or setting to 1) to ensure it doesn't
        // exceed the limit
        // This is a redundant check if the previous check was `currentCount >= limit`,
        // but it ensures the final state is checked.
        // For a more robust check, one might use Lua scripts for atomic operations.
        String finalCountStr = redisTemplate.opsForValue().get(key);
        Long finalCount = (finalCountStr != null) ? Long.valueOf(finalCountStr) : 0L; // Default to 0 if somehow null

        if (finalCount > rateLimited.limit()) {
            log.warn("[RateLimit] EXCEEDED key={} userId={} count={}", rateLimited.key(), userId, finalCount);
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Rate limit exceeded for " + rateLimited.key() +
                            ". Limit: " + rateLimited.limit() + " per " + rateLimited.per().toLowerCase() + ".");
        }

        return pjp.proceed();
    }

    private String resolveUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonymous";
    }

    private String resolveWindow(String per) {
        return switch (per) {
            case "HOUR" -> LocalDate.now() + "T" + LocalTime.now().getHour();
            case "MINUTE" -> LocalDate.now() + "T" + LocalTime.now().getHour() + ":" + LocalTime.now().getMinute();
            default -> LocalDate.now().toString();
        };
    }
}
