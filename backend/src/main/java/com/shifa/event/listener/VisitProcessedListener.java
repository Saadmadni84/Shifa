package com.shifa.event.listener;

import com.shifa.domain.notification.NotificationService;
import com.shifa.event.VisitProcessedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VisitProcessedListener {

    private final NotificationService notificationService;

    @EventListener
    @Async("notificationTaskExecutor")
    public void onVisitProcessed(VisitProcessedEvent event) {
        log.info("Visit processed event received: {}", event.getVisit().getId());
        notificationService.notifyDoctorAIComplete(event.getVisit());
    }
}
