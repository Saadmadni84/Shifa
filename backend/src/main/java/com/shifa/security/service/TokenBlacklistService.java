package com.shifa.security.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;

    private static final String BLOCKLIST_PREFIX = "shifa:jwt:blocklist:";
    private static final String REFRESH_PREFIX = "shifa:jwt:refresh:";

    public void blacklist(String jti, Date expiration) {
        long ttlMs = expiration.getTime() - System.currentTimeMillis();
        if (ttlMs <= 0)
            return;

        String key = BLOCKLIST_PREFIX + jti;
        redisTemplate.opsForValue().set(key, "revoked", Duration.ofMillis(ttlMs));
        log.debug("[TokenBlacklist] Blacklisted jti={} for {}ms", jti, ttlMs);
    }

    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(
                redisTemplate.hasKey(BLOCKLIST_PREFIX + jti));
    }

    public void storeRefreshToken(String refreshToken, String userId, Duration ttl) {
        String key = REFRESH_PREFIX + refreshToken;
        redisTemplate.opsForValue().set(key, userId, ttl);
        log.debug("[TokenBlacklist] Stored refresh token for userId={}", userId);
    }

    public String consumeRefreshToken(String refreshToken) {
        String key = REFRESH_PREFIX + refreshToken;
        String userId = redisTemplate.opsForValue().get(key);
        if (userId != null) {
            redisTemplate.delete(key);
            log.debug("[TokenBlacklist] Consumed refresh token for userId={}", userId);
        }
        return userId;
    }

    public void revokeAllRefreshTokens(String userId) {
        log.warn("[TokenBlacklist] Force-logout requested for userId={} — implement user token index if needed",
                userId);
    }
}
