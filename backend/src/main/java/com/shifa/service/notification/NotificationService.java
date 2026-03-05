package com.shifa.service.notification;

import com.shifa.domain.notification.Notification;
import com.shifa.domain.notification.NotificationRepository;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MedicineReminderFactory reminderFactory;

    @Transactional
    public int scheduleMedicationReminders(Visit visit) {
        List<Notification> reminders = reminderFactory.createReminders(visit);
        notificationRepository.saveAll(reminders);
        log.info("[NotificationService] {} medication reminders scheduled for visitId={}",
                reminders.size(), visit.getId());
        return reminders.size();
    }

    @Transactional
    public Notification createReminder(
            Patient patient, Visit visit, String type,
            String message, LocalDateTime scheduledFor) {
        Notification n = new Notification();
        n.setPatient(patient);
        n.setVisit(visit);
        n.setType(type);
        n.setTitle(buildTitle(type, patient.getPreferredLanguage()));
        n.setMessage(message);
        n.setScheduledFor(scheduledFor);
        n.setStatus("PENDING");
        n.setRetryCount(0);
        n.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(n);
    }

    @Transactional
    public int cancelPatientReminders(Long patientId) {
        int count = notificationRepository.cancelPatientNotifications(patientId);
        log.info("[NotificationService] Cancelled {} reminders for patientId={}", count, patientId);
        return count;
    }

    private String buildTitle(String type, String lang) {
        return switch (type + ":" + lang) {
            case "MEDICINE_REMINDER:hi" -> "💊 दवाई लेने का समय";
            case "MEDICINE_REMINDER:ta" -> "💊 மருந்து எடுக்கும் நேரம்";
            case "FOLLOW_UP:hi" -> "📅 डॉक्टर से मिलने का समय";
            case "TEST_REMINDER:hi" -> "🧪 टेस्ट करवाने का समय";
            default -> "💊 Medication Reminder";
        };
    }
}
