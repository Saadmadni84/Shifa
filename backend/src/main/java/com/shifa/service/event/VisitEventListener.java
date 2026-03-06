package com.shifa.service.event;

import com.shifa.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VisitEventListener {

    private final NotificationService notificationService;

    @Async
    @EventListener
    public void onVisitSent(VisitSentEvent event) {
        try {
            int count = notificationService.scheduleMedicationReminders(event.getVisit());
            log.info("[VisitEventListener] Scheduled {} reminders for visitId={}",
                    count, event.getVisit().getId());
        } catch (Exception e) {
            log.error("[VisitEventListener] Failed to schedule reminders for visitId={}",
                    event.getVisit().getId(), e);
        }
    }
}
