package com.shifa.common.aop;

import com.shifa.common.annotation.RateLimited;
import com.shifa.common.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitAspect {

    private final StringRedisTemplate redisTemplate;

    @Around("@annotation(rateLimited)")
    public Object enforceRateLimit(ProceedingJoinPoint joinPoint, RateLimited rateLimited) throws Throwable {
        try {
            String clientIp = getClientIp();
            String key = rateLimited.key().isEmpty() 
                    ? joinPoint.getSignature().toShortString() 
                    : rateLimited.key();
            
            String redisKey = "rate_limit:" + key + ":" + clientIp;
            int limit = rateLimited.limit();
            long window = rateLimited.windowInSeconds();

            Long count = redisTemplate.opsForValue().increment(redisKey);
            
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(window));
            }

            if (count != null && count > limit) {
                log.warn("Rate limit exceeded for IP {} on key {}", clientIp, key);
                throw new RateLimitExceededException("Rate limit exceeded. Try again later.", window);
            }
        } catch (RateLimitExceededException ex) {
            throw ex;
        } catch (Exception ex) {
            // Fail open if Redis is down
            log.warn("Rate limiting failed (Redis might be down), allowing request: {}", ex.getMessage());
        }
        
        return joinPoint.proceed();
    }

    private String getClientIp() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            HttpServletRequest request = attributes.getRequest();
            String xfHeader = request.getHeader("X-Forwarded-For");
            return xfHeader == null ? request.getRemoteAddr() : xfHeader.split(",")[0];
        }
        return "UNKNOWN";
    }
}
