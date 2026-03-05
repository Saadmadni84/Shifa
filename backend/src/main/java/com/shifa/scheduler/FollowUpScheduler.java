package com.shifa.scheduler;

import com.shifa.integration.whatsapp.WhatsAppService;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.doctor.Doctor;
import com.shifa.scheduler.annotation.SchedulerLock;
import com.shifa.scheduler.config.SchedulerConfig;
import com.shifa.scheduler.util.ISTTimeUtil;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FollowUpScheduler {

    private final VisitRepository visitRepository;
    private final WhatsAppService whatsAppService;
    private final SchedulerConfig schedulerConfig;

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Kolkata")
    @SchedulerLock(lockName = "followup_scheduler", atMostForSeconds = 300)
    @Transactional(readOnly = true)
    public void sendFollowUpReminders() {
        if (!schedulerConfig.isSchedulerEnabled())
            return;

        LocalDate today = ISTTimeUtil.nowIST().toLocalDate();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate threeDaysAgo = today.minusDays(3);

        List<Visit> tomorrowFollowUps = visitRepository.findByFollowUpDate(tomorrow);
        log.info("[FollowUpScheduler] Tomorrow follow-ups: {}", tomorrowFollowUps.size());

        for (Visit visit : tomorrowFollowUps) {
            try {
                if (visit.getPatient() == null || visit.getDoctor() == null)
                    continue;

                Patient patient = visit.getPatient();
                Doctor doctor = visit.getDoctor();

                String templateName = "shifa_followup_tomorrow_"
                        + (patient.getPreferredLanguage() != null ? patient.getPreferredLanguage().toLowerCase()
                                : "en");
                whatsAppService.sendTemplateMessage(
                        patient.getPhoneNumber(),
                        templateName,
                        List.of(
                                patient.getName(),
                                doctor.getName(),
                                ISTTimeUtil.format(visit.getVisitDate().atStartOfDay())));
                log.info("[FollowUpScheduler] Tomorrow reminder sent \u2014 visitId={} patientId={}",
                        visit.getId(), patient.getId());
            } catch (Exception e) {
                log.error("[FollowUpScheduler] Failed to send tomorrow reminder visitId={}: {}",
                        visit.getId(), e.getMessage());
            }
        }

        List<Visit> todayFollowUps = visitRepository.findByFollowUpDate(today);
        for (Visit visit : todayFollowUps) {
            try {
                if (visit.getPatient() == null || visit.getDoctor() == null)
                    continue;

                Patient patient = visit.getPatient();
                Doctor doctor = visit.getDoctor();
                whatsAppService.sendTemplateMessage(
                        patient.getPhoneNumber(),
                        "shifa_followup_today",
                        List.of(patient.getName(), doctor.getName()));
                log.info("[FollowUpScheduler] Today reminder sent \u2014 visitId={}", visit.getId());
            } catch (Exception e) {
                log.error("[FollowUpScheduler] Failed to send today reminder visitId={}: {}",
                        visit.getId(), e.getMessage());
            }
        }

        List<Visit> missedFollowUps = visitRepository.findMissedFollowUps(threeDaysAgo);
        for (Visit visit : missedFollowUps) {
            try {
                Optional<Patient> patientOpt = Optional.ofNullable(visit.getPatient());
                Optional<Doctor> doctorOpt = Optional.ofNullable(visit.getDoctor());
                if (patientOpt.isEmpty() || doctorOpt.isEmpty())
                    continue;

                Patient patient = visit.getPatient();
                Doctor doctor = visit.getDoctor();
                whatsAppService.sendTemplateMessage(
                        patient.getPhoneNumber(),
                        "shifa_followup_missed",
                        List.of(patient.getName(), doctor.getName()));
                log.info("[FollowUpScheduler] Missed follow-up alert sent \u2014 visitId={}", visit.getId());
            } catch (Exception e) {
                log.error("[FollowUpScheduler] Failed missed alert visitId={}: {}",
                        visit.getId(), e.getMessage());
            }
        }
    }
}
