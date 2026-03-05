package com.shifa.scheduler.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.util.TimeZone;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Value("${shifa.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    @Value("${shifa.scheduler.pool-size:5}")
    private int poolSize;

    static {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(poolSize);
        scheduler.setThreadNamePrefix("shifa-sched-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(30);
        scheduler.setErrorHandler(throwable -> {
            System.err.println("[SCHEDULER-ERROR] Unhandled exception in scheduled task: "
                    + throwable.getMessage());
        });
        return scheduler;
    }

    public boolean isSchedulerEnabled() {
        return schedulerEnabled;
    }
}
