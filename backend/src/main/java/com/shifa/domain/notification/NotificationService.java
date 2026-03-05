package com.shifa.domain.notification;

import com.shifa.domain.visit.Visit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    // Missing WhatsAppService and SmsService, will add them implicitly to make compiling work later

    public void sendVisitSummary(Visit visit) {
        // Implementation stub
    }

    public void notifyDoctorAIComplete(Visit visit) {
        // Implementation stub
    }
}
