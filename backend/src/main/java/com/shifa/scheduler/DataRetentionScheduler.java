package com.shifa.scheduler;

import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.scheduler.annotation.SchedulerLock;
import com.shifa.scheduler.config.SchedulerConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataRetentionScheduler {

    private final PatientRepository patientRepository;
    private final SchedulerConfig schedulerConfig;

    private static final int RETENTION_YEARS = 7;

    @Scheduled(cron = "0 0 2 * * SUN", zone = "Asia/Kolkata")
    @SchedulerLock(lockName = "data_retention_scheduler", atMostForSeconds = 3600)
    @Transactional
    public void runDataRetention() {
        if (!schedulerConfig.isSchedulerEnabled())
            return;

        LocalDateTime cutoff = LocalDateTime.now().minusYears(RETENTION_YEARS);
        LocalDate recentDate = LocalDate.now().minusYears(RETENTION_YEARS);

        List<Patient> candidates = patientRepository
                .findInactivePatientsBeforeCutoff(cutoff, recentDate);

        log.info("[DataRetentionScheduler] {} patients eligible for data retention", candidates.size());

        int purged = 0;
        for (Patient patient : candidates) {
            try {
                // Soft delete
                patient.setDeleted(true);
                patient.setDeletedAt(LocalDateTime.now());
                patient.setDeleteReason("AUTO_RETENTION_DPDP");
                patient.setPhoneNumber(null);
                // patient.setAbhaId(null); // Ignoring if AbhaId is missing
                // patient.setEmail(null); // Ignoring if Email is missing
                patientRepository.save(patient);
                purged++;
                log.info("[DataRetentionScheduler] Soft-deleted patientId={}", patient.getId());
            } catch (Exception e) {
                log.error("[DataRetentionScheduler] Failed for patientId={}: {}",
                        patient.getId(), e.getMessage());
            }
        }

        log.info("[DataRetentionScheduler] Complete \u2014 {}/{} patients soft-deleted", purged, candidates.size());
    }
}
