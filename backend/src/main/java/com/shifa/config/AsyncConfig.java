// src/main/java/com/shifa/config/AsyncConfig.java
package com.shifa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * AsyncConfig — Dedicated thread pools for async service operations.
 *
 * Three pools:
 * 1. aiProcessingExecutor — Claude API calls (slow, I/O-bound, 5 threads)
 * 2. auditExecutor — Audit log writes (fast DB inserts, 3 threads)
 * 3. notificationExecutor — Event listener (reminder scheduling, 2 threads)
 *
 * Why separate pools? Prevents slow AI calls from blocking audit writes.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("aiProcessingExecutor")
    public Executor aiProcessingExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(3);
        exec.setMaxPoolSize(10);
        exec.setQueueCapacity(50);
        exec.setThreadNamePrefix("shifa-ai-");
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(60);
        exec.initialize();
        return exec;
    }

    @Bean("auditExecutor")
    public Executor auditExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(2);
        exec.setMaxPoolSize(5);
        exec.setQueueCapacity(200);
        exec.setThreadNamePrefix("shifa-audit-");
        exec.initialize();
        return exec;
    }

    @Bean("notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(2);
        exec.setMaxPoolSize(4);
        exec.setQueueCapacity(100);
        exec.setThreadNamePrefix("shifa-notif-");
        exec.initialize();
        return exec;
    }
}