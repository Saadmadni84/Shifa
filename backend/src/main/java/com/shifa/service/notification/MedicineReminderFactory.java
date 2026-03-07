package com.shifa.service.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.common.enums.NotificationStatus;
import com.shifa.common.enums.NotificationType;
import com.shifa.domain.notification.Notification;
import com.shifa.scheduler.util.ISTTimeUtil;
import com.shifa.service.dto.VisitSummaryData;
import com.shifa.domain.visit.Visit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicineReminderFactory {

    private final ObjectMapper objectMapper;

    private static final int MAX_DURATION_DAYS = 30;

    public List<Notification> createReminders(Visit visit) {
        List<Notification> reminders = new ArrayList<>();

        if (visit.getAiSummaryJson() == null)
            return reminders;

        VisitSummaryData summary;
        try {
            summary = objectMapper.readValue(visit.getAiSummaryJson(), VisitSummaryData.class);
        } catch (Exception e) {
            log.error("[MedicineReminderFactory] Failed to parse summary for visitId={}", visit.getId(), e);
            return reminders;
        }

        LocalDate startDate = LocalDate.now();

        for (VisitSummaryData.MedicationSummary med : summary.getMedications()) {
            int duration = med.getDurationDays() != null
                    ? Math.min(med.getDurationDays(), MAX_DURATION_DAYS)
                    : 7;

            List<Integer> reminderHours = parseReminderHours(med.getFrequency(), med.getTiming());

            for (int day = 0; day < duration; day++) {
                LocalDate reminderDate = startDate.plusDays(day);
                for (int hour : reminderHours) {
                    ZonedDateTime ist = reminderDate.atTime(hour, 0)
                            .atZone(ISTTimeUtil.IST);
                    LocalDateTime utc = ISTTimeUtil.toUTC(ist);

                    if (utc.isBefore(LocalDateTime.now()))
                        continue;

                    Notification n = new Notification();
                    n.setPatient(visit.getPatient());
                    n.setVisit(visit);
                    n.setType(NotificationType.MEDICATION_REMINDER);
                    n.setTitle(buildTitle(med.getName(), visit.getPatient().getPreferredLanguage().getCode()));
                    n.setMessage(buildMessage(med, hour, visit.getPatient().getPreferredLanguage().getCode()));
                    n.setScheduledFor(utc);
                    n.setStatus(NotificationStatus.PENDING);
                    n.setRetryCount(0);
                    n.setCreatedAt(LocalDateTime.now());
                    reminders.add(n);
                }
            }
        }

        log.info("[MedicineReminderFactory] Generated {} reminders for visitId={}",
                reminders.size(), visit.getId());
        return reminders;
    }

    private List<Integer> parseReminderHours(String frequency, String timing) {
        if (frequency == null)
            return List.of(9);

        String f = frequency.toLowerCase();
        String t = timing != null ? timing.toLowerCase() : "";

        if (f.contains("once") || f.contains("once daily") || f.contains("od"))
            return resolveOnce(t);
        if (f.contains("twice") || f.contains("two times") || f.contains("bd"))
            return List.of(8, 21);
        if (f.contains("three") || f.contains("thrice") || f.contains("tds"))
            return List.of(8, 13, 21);
        if (f.contains("four") || f.contains("qid"))
            return List.of(8, 12, 16, 21);

        return resolveOnce(t);
    }

    private List<Integer> resolveOnce(String timing) {
        if (timing.contains("night") || timing.contains("bed") || timing.contains("raat"))
            return List.of(22);
        if (timing.contains("evening") || timing.contains("shaam"))
            return List.of(18);
        if (timing.contains("afternoon") || timing.contains("lunch"))
            return List.of(13);
        return List.of(8);
    }

    private String buildTitle(String medName, String lang) {
        return switch (lang) {
            case "hi" -> "💊 " + medName + " लेने का समय";
            case "ta" -> "💊 " + medName + " எடுக்கும் நேரம்";
            case "te" -> "💊 " + medName + " వేసుకునే సమయం";
            case "bn" -> "💊 " + medName + " নেওয়ার সময়";
            default -> "💊 Time to take " + medName;
        };
    }

    private String buildMessage(VisitSummaryData.MedicationSummary med, int hour, String lang) {
        String timeLabel = hour < 10 ? "subah" : hour < 14 ? "dopahar" : hour < 18 ? "shaam" : "raat";
        return switch (lang) {
            case "hi" -> med.getName() + " " + (med.getDosage() != null ? med.getDosage() : "") +
                    " " + timeLabel + " " + (med.getTiming() != null ? med.getTiming() : "") + " लें।";
            default -> "Take " + med.getName() + " " + (med.getDosage() != null ? med.getDosage() : "") +
                    " " + (med.getTiming() != null ? med.getTiming() : "as prescribed") + ".";
        };
    }
}
