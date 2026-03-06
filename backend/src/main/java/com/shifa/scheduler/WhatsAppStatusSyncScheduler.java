package com.shifa.scheduler;

import com.shifa.integration.whatsapp.WhatsAppDeliveryLog;
import com.shifa.integration.whatsapp.WhatsAppDeliveryLogRepository;
import com.shifa.domain.notification.Notification;
import com.shifa.domain.notification.NotificationRepository;
import com.shifa.scheduler.annotation.SchedulerLock;
import com.shifa.scheduler.config.SchedulerConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class WhatsAppStatusSyncScheduler {

    private final WhatsAppDeliveryLogRepository deliveryLogRepository;
    private final NotificationRepository notificationRepository;
    private final SchedulerConfig schedulerConfig;

    @Scheduled(fixedDelay = 300_000)
    @SchedulerLock(lockName = "wa_status_sync", atMostForSeconds = 250)
    @Transactional
    public void syncDeliveryStatuses() {
        if (!schedulerConfig.isSchedulerEnabled())
            return;

        List<WhatsAppDeliveryLog> unsyncedLogs = deliveryLogRepository.findUnsyncedStatusUpdates();

        log.info("[WhatsAppStatusSync] {} unsynced delivery receipts", unsyncedLogs.size());

        for (WhatsAppDeliveryLog log : unsyncedLogs) {
            try {
                Optional<Notification> notif = notificationRepository.findByMetaMessageId(log.getMetaMessageId());

                notif.ifPresentOrElse(notification -> {
                    notification.setDeliveryStatus(log.getStatus());
                    if ("DELIVERED".equals(log.getStatus())) {
                        notification.setDeliveredAt(log.getTimestamp());
                    } else if ("READ".equals(log.getStatus())) {
                        notification.setReadAt(log.getTimestamp());
                    }
                    notificationRepository.save(notification);
                    log.setSynced(true);
                    log.setSyncedAt(LocalDateTime.now());
                    deliveryLogRepository.save(log);
                }, () -> {
                    this.log.warn("[WhatsAppStatusSync] No notification found for metaMessageId={}",
                            log.getMetaMessageId());
                    log.setSynced(true);
                    deliveryLogRepository.save(log);
                });

            } catch (Exception e) {
                this.log.error("[WhatsAppStatusSync] Error syncing logId={}: {}",
                        log.getId(), e.getMessage());
            }
        }
    }
}
