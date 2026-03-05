package com.shifa.config;

import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
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
public class RedisConfig {

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory cf) {
        RedisTemplate<String, String> t = new RedisTemplate<>();
        t.setConnectionFactory(cf);
        t.setKeySerializer(new StringRedisSerializer());
        t.setValueSerializer(new StringRedisSerializer());
        t.afterPropertiesSet();
        return t;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory cf) {
        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(pair(new StringRedisSerializer()))
            .serializeValuesWith(pair(new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(cf)
            .cacheDefaults(base)
            .withCacheConfiguration("doctors",      base.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("languages",    base.entryTtl(Duration.ofDays(1)))
            .withCacheConfiguration("translations", base.entryTtl(Duration.ofDays(7)))
            .build();
    }

    private static <T> RedisSerializationContext.SerializationPair<T> pair(RedisSerializer<T> s) {
        return RedisSerializationContext.SerializationPair.fromSerializer(s);
    }
}
