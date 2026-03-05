package com.shifa.scheduler;

import com.shifa.domain.notification.NotificationRepository;
import com.shifa.scheduler.config.SchedulerConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerHealthMonitor {

    private final NotificationRepository notificationRepository;
    // private final StringRedisTemplate redisTemplate;
    private final SchedulerConfig schedulerConfig;

    private static final int STALE_THRESHOLD_HOURS = 2;
    private static final double FAILURE_RATE_ALERT = 0.20;

    @Scheduled(fixedDelay = 600_000)
    public void runHealthChecks() {
        if (!schedulerConfig.isSchedulerEnabled())
            return;

        checkStaleNotifications();
        checkFailureRate();
    }

    private void checkStaleNotifications() {
        LocalDateTime staleThreshold = LocalDateTime.now().minusHours(STALE_THRESHOLD_HOURS);
        int staleCount = notificationRepository.countStalePendingNotifications(staleThreshold);

        if (staleCount > 0) {
            log.warn("[SchedulerHealth] \u26A0\uFE0F  {} notifications stuck in PENDING for > {}h \u2014 re-queuing",
                    staleCount, STALE_THRESHOLD_HOURS);
            notificationRepository.resetStalePendingNotifications(staleThreshold);
        } else {
            log.debug("[SchedulerHealth] No stale notifications");
        }
    }

    private void checkFailureRate() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        long total = notificationRepository.countNotificationsSince(since);
        long failed = notificationRepository.countFailedNotificationsSince(since);

        if (total == 0)
            return;

        double failRate = (double) failed / total;
        if (failRate > FAILURE_RATE_ALERT) {
            log.error(
                    "[SchedulerHealth] \uD83D\uDEA8 HIGH FAILURE RATE: {}/{} notifications failed ({:.0f}%) in last 24h",
                    failed, total, failRate * 100);
        } else {
            log.info("[SchedulerHealth] Failure rate OK: {}/{} ({:.1f}%)", failed, total, failRate * 100);
        }
    }
}
