package com.shifa.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

/**
 * Redis configuration for Shifa.
 *
 * Redis serves four purposes:
 *
 *  ① OTP storage          shifa:otp:{phone}               TTL 5 min
 *                         shifa:otp:attempts:{phone}       TTL 15 min
 *  ② JWT blocklist        shifa:jwt:blocklist:{jti}        TTL = token remaining life
 *  ③ Rate limiting        shifa:ratelimit:ai:{uid}:{date}  TTL 24 h
 *                         shifa:ratelimit:wa:{phone}:{hr}  TTL 1 h
 *  ④ Spring @Cacheable    per-cache TTLs defined in cacheManager()
 *
 * Serialization strategy:
 *   Keys   → StringRedisSerializer  (human-readable in redis-cli)
 *   Values → GenericJackson2JsonRedisSerializer  (JSON, not Java serialization —
 *            avoids ClassCastException when model classes are refactored)
 */
@Slf4j
@Configuration
@EnableCaching
@EnableRedisRepositories
@RequiredArgsConstructor
public class RedisConfig {

    private final ObjectMapper objectMapper;

    // ─────────────────────────────────────────────────────────────
    // RedisTemplate<String, Object> — for direct Redis operations
    // ─────────────────────────────────────────────────────────────

    /**
     * Primary template used by OtpService, JwtService, RateLimitAspect.
     * Keys: String  Values: JSON-serialized objects
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        StringRedisSerializer keySerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer valueSerializer =
            new GenericJackson2JsonRedisSerializer(objectMapper);

        template.setKeySerializer(keySerializer);
        template.setHashKeySerializer(keySerializer);
        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * String-only template — for INCR counters, OTP codes, and JWT blocklist flags
     * where the value is a plain string (no JSON overhead needed).
     */
    @Bean(name = "stringRedisTemplate")
    public RedisTemplate<String, String> stringRedisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        StringRedisSerializer serializer = new StringRedisSerializer();
        template.setKeySerializer(serializer);
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(serializer);
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }

    // ─────────────────────────────────────────────────────────────
    // Spring CacheManager (@Cacheable / @CacheEvict)
    // ─────────────────────────────────────────────────────────────

    /**
     * Per-cache TTL configuration:
     *
     *  Cache name        TTL      Contents
     *  ─────────────────────────────────────────────────────────
     *  languages         24 h     Supported language list
     *  doctors           30 min   DoctorResponse by doctor UUID
     *  patients          10 min   PatientResponse by patient UUID
     *  visit-portal      30 min   Patient portal data by token
     *  visit-summaries    1 h     AI-generated visit summary
     *  (default)         10 min   Any other @Cacheable method
     *
     * Key prefix: "shifa:" — isolates Shifa keys in a shared Redis instance.
     * Null values are never cached (disableCachingNullValues).
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {

        GenericJackson2JsonRedisSerializer jsonSerializer =
            new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaults = RedisCacheConfiguration
            .defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .prefixCacheNameWith("shifa:")
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(jsonSerializer));

        return RedisCacheManager.builder(factory)
            .cacheDefaults(defaults)
            .withInitialCacheConfigurations(Map.of(
                "languages",        defaults.entryTtl(Duration.ofHours(24)),
                "doctors",          defaults.entryTtl(Duration.ofMinutes(30)),
                "patients",         defaults.entryTtl(Duration.ofMinutes(10)),
                "visit-portal",     defaults.entryTtl(Duration.ofMinutes(30)),
                "visit-summaries",  defaults.entryTtl(Duration.ofHours(1))
            ))
            .transactionAware()
            .build();
    }
}
