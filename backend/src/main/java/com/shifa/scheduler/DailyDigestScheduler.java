package com.shifa.scheduler;

import com.shifa.domain.doctor.Doctor;
import com.shifa.domain.doctor.DoctorRepository;
import com.shifa.integration.whatsapp.WhatsAppService;
import com.shifa.domain.notification.NotificationRepository;
import com.shifa.scheduler.annotation.SchedulerLock;
import com.shifa.scheduler.config.SchedulerConfig;
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
public class DailyDigestScheduler {

    private final DoctorRepository doctorRepository;
    private final VisitRepository visitRepository;
    private final NotificationRepository notificationRepository;
    private final WhatsAppService whatsAppService;
    private final SchedulerConfig schedulerConfig;

    @Scheduled(cron = "0 30 7 * * MON-SAT", zone = "Asia/Kolkata")
    @SchedulerLock(lockName = "daily_digest_scheduler", atMostForSeconds = 600)
    @Transactional(readOnly = true)
    public void sendDailyDigests() {
        if (!schedulerConfig.isSchedulerEnabled())
            return;

        LocalDate today = LocalDate.now();

        List<Doctor> doctors = doctorRepository.findAllWithDigestEnabled();
        log.info("[DailyDigestScheduler] Sending digest to {} doctors", doctors.size());

        for (Doctor doctor : doctors) {
            try {
                int followUpsToday = visitRepository.countFollowUpsByDoctorAndDate(doctor.getId(), today);
                int pendingDrafts = visitRepository.countDraftVisitsByDoctor(doctor.getId());
                int failedNotifs = notificationRepository.countFailedSinceYesterday(doctor.getId(),
                        today.atStartOfDay());
                int remindersGoingOut = notificationRepository.countScheduledForToday(doctor.getId(), today);

                if (followUpsToday == 0 && pendingDrafts == 0 && failedNotifs == 0) {
                    continue;
                }

                whatsAppService.sendTemplateMessage(
                        doctor.getPhoneNumber(),
                        "shifa_doctor_digest",
                        List.of(
                                doctor.getName(),
                                String.valueOf(followUpsToday),
                                String.valueOf(remindersGoingOut),
                                String.valueOf(pendingDrafts),
                                String.valueOf(failedNotifs)));
                log.info("[DailyDigestScheduler] Digest sent to doctorId={}", doctor.getId());

            } catch (Exception e) {
                log.error("[DailyDigestScheduler] Failed for doctorId={}: {}", doctor.getId(), e.getMessage());
            }
        }
    }
}
