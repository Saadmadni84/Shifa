package com.shifa.scheduler;

import com.shifa.integration.whatsapp.WhatsAppService;
import com.shifa.common.enums.NotificationStatus;
import com.shifa.domain.notification.Notification;
import com.shifa.domain.notification.NotificationRepository;
import com.shifa.scheduler.annotation.SchedulerLock;
import com.shifa.scheduler.config.SchedulerConfig;
import com.shifa.scheduler.dto.ReminderResult;
import com.shifa.scheduler.dto.SchedulerRunReport;
import com.shifa.scheduler.util.ISTTimeUtil;
import com.shifa.scheduler.util.RetryUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component("schedulerReminderScheduler")
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final NotificationRepository notificationRepository;
    private final WhatsAppService whatsAppService;
    private final SchedulerConfig schedulerConfig;

    private static final int MAX_RETRY_COUNT = 3;
    private static final int BATCH_SIZE = 50;

    @Scheduled(fixedDelay = 60_000)
    @SchedulerLock(lockName = "reminder_scheduler", atMostForSeconds = 55)
    @Transactional
    public void sendPendingReminders() {
        if (!schedulerConfig.isSchedulerEnabled()) {
            return;
        }

        Instant startedAt = Instant.now();
        List<ReminderResult> results = new ArrayList<>();
        int skipped = 0;

        List<Notification> due = notificationRepository
            .findPendingNotificationsDue(
                NotificationStatus.PENDING,
                LocalDateTime.now(),
                MAX_RETRY_COUNT,
                PageRequest.of(0, BATCH_SIZE));

        log.info("[ReminderScheduler] {} notifications due", due.size());

        for (Notification notification : due) {
            if (ISTTimeUtil.isWithinQuietHours(LocalDateTime.now())) {
                notification.setScheduledFor(ISTTimeUtil.nextMorning8AM());
                notificationRepository.save(notification);
                skipped++;
                log.info("[ReminderScheduler] Quiet hours \u2014 rescheduled notif {} to 8 AM IST",
                        notification.getId());
                continue;
            }

            long sendStart = System.currentTimeMillis();
            String context = "WhatsApp send notificationId=" + notification.getId();

            try {
                RetryUtil.withRetry(
                        () -> {
                            whatsAppService.sendReminder(notification);
                            return null;
                        },
                        MAX_RETRY_COUNT, 2_000L, context);

                notification.setSentAt(LocalDateTime.now());
                notification.setStatus(NotificationStatus.SENT);
                notificationRepository.save(notification);

                results.add(ReminderResult.ok(
                        notification.getId(),
                        notification.getPatientId(),
                    notification.getTypeCode(),
                        "WHATSAPP",
                        System.currentTimeMillis() - sendStart));

            } catch (Exception ex) {
                notification.setRetryCount(notification.getRetryCount() + 1);
                notification.setStatus(notification.getRetryCount() >= MAX_RETRY_COUNT
                    ? NotificationStatus.FAILED
                    : NotificationStatus.PENDING);
                notification.setErrorMessage(ex.getMessage());
                notificationRepository.save(notification);

                results.add(ReminderResult.fail(
                        notification.getId(),
                        notification.getPatientId(),
                    notification.getTypeCode(),
                        "WHATSAPP",
                        ex.getMessage()));

                log.error("[ReminderScheduler] FAILED notificationId={} after {} retries: {}",
                        notification.getId(), MAX_RETRY_COUNT, ex.getMessage());
            }
        }

        SchedulerRunReport report = SchedulerRunReport.builder()
                .schedulerName("ReminderScheduler")
                .startedAt(startedAt)
                .finishedAt(Instant.now())
                .totalProcessed(due.size())
                .successCount((int) results.stream().filter(ReminderResult::isSuccess).count())
                .failureCount((int) results.stream().filter(r -> !r.isSuccess()).count())
                .skippedCount(skipped)
                .results(results)
                .build();

        log.info(report.summary());
    }
}
