package com.shifa.scheduler.annotation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerLockAspect {

    private final StringRedisTemplate redisTemplate;
    private static final String KEY_PREFIX = "scheduler_lock:";

    @Around("@annotation(schedulerLock)")
    public Object acquireAndRun(ProceedingJoinPoint pjp, SchedulerLock schedulerLock) throws Throwable {
        String lockKey = KEY_PREFIX + schedulerLock.lockName();
        String lockValue = "locked";

        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, Duration.ofSeconds(schedulerLock.atMostForSeconds()));

        if (Boolean.TRUE.equals(acquired)) {
            log.debug("[LOCK] Acquired '{}' \u2014 proceeding", lockKey);
            try {
                return pjp.proceed();
            } finally {
                redisTemplate.delete(lockKey);
                log.debug("[LOCK] Released '{}'", lockKey);
            }
        } else {
            log.warn("[LOCK] Skipped '{}' \u2014 already running on another pod", lockKey);
            return null;
        }
    }
}
