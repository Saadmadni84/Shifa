package com.shifa.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Async thread pool configuration for Shifa.
 *
 * Three dedicated pools — isolation prevents one subsystem starving another:
 *
 *  aiTaskExecutor       → Claude AI API calls (3–5 s each)
 *  whatsappTaskExecutor → WhatsApp message sends
 *  auditTaskExecutor    → DPDP audit log writes (fire-and-forget)
 *  getAsyncExecutor()   → Default fallback for any other @Async method
 */
@Slf4j
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig implements AsyncConfigurer {

    // ─────────────────────────────────────────────────────────────
    // AI Processing Executor
    // ─────────────────────────────────────────────────────────────

    @Bean(name = "aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("AI-Async-");
        // CallerRunsPolicy: never silently drop an AI summarisation task
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60); // let in-flight AI calls finish
        executor.initialize();
        return executor;
    }

    // ─────────────────────────────────────────────────────────────
    // WhatsApp Messaging Executor
    // ─────────────────────────────────────────────────────────────

    @Bean(name = "whatsappTaskExecutor")
    public Executor whatsappTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(200); // large queue for end-of-clinic bulk sends
        executor.setThreadNamePrefix("WA-Async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }

    // ─────────────────────────────────────────────────────────────
    // Audit Logging Executor  (DPDP Act 2023 compliance)
    // ─────────────────────────────────────────────────────────────

    /**
     * Must NEVER block HTTP threads. Audit failure must never fail an API call.
     * DiscardOldestPolicy: on overflow newer events matter more than stale ones.
     * CloudWatch structured logs act as backup audit trail.
     */
    @Bean(name = "auditTaskExecutor")
    public Executor auditTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("Audit-Async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(false);
        executor.initialize();
        return executor;
    }

    // ─────────────────────────────────────────────────────────────
    // Default @Async Executor
    // ─────────────────────────────────────────────────────────────

    /** Used by @Async methods that don't specify a named executor. */
    @Override
    @Bean(name = "generalExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("General-Async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }

    // ─────────────────────────────────────────────────────────────
    // Global uncaught exception handler for void @Async methods
    // ─────────────────────────────────────────────────────────────

    /**
     * Without this, exceptions from void @Async methods are silently swallowed.
     * This logs them so they appear in CloudWatch and trigger alarms.
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new ShifaAsyncExceptionHandler();
    }

    private static class ShifaAsyncExceptionHandler
            implements AsyncUncaughtExceptionHandler {

        private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(ShifaAsyncExceptionHandler.class);

        @Override
        public void handleUncaughtException(
                Throwable ex, Method method, Object... params) {
            log.error("Uncaught @Async exception in [{}.{}]: {}",
                method.getDeclaringClass().getSimpleName(),
                method.getName(),
                ex.getMessage(), ex);
        }
    }
}
