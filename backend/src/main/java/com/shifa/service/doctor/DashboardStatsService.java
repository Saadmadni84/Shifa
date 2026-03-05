package com.shifa.service.doctor;

import com.shifa.domain.notification.NotificationRepository;
import com.shifa.service.dto.DashboardStatsDTO;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.domain.visit.VisitStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardStatsService {

    private final VisitRepository visitRepository;
    private final NotificationRepository notificationRepository;

    @Cacheable(value = "dashboard-stats", key = "#doctorId")
    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats(UUID doctorId) {
        LocalDate today = LocalDate.now();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        LocalDate monthStart = today.withDayOfMonth(1);

        return DashboardStatsDTO.builder()
                .todayVisits((int)visitRepository.countByDoctorUserIdAndVisitDate(doctorId, today))
                .todayFollowUps((int)visitRepository.countFollowUpsByDoctorAndDate(doctorId, today))
                .monthVisits((int)visitRepository.countByDoctorUserIdAndVisitDateAfter(doctorId, monthStart))
                .monthNewPatients((int)visitRepository.countNewPatientsByDoctorSince(doctorId, monthStart))
                .pendingAiProcessing((int)visitRepository.countByDoctorUserIdAndStatus(doctorId, VisitStatus.NOTES_TAKEN))
                .pendingSendToPatient((int)visitRepository.countByDoctorUserIdAndStatus(doctorId, VisitStatus.REVIEWED))
                .failedNotifications((int)notificationRepository.countFailedNotificationsSince(weekAgo))
                .totalPatients((int)visitRepository.countDistinctPatientsByDoctorUserId(doctorId))
                .totalVisits((int)visitRepository.countByDoctorUserIdAndDeletedFalse(doctorId))
                .whatsappReadRate(calculateReadRate(doctorId))
                .topLanguage(visitRepository.findTopPatientLanguageByDoctorUserId(doctorId).stream().findFirst().map(arr -> (String)arr[0]).orElse("hi"))
                .build();
    }

    private double calculateReadRate(UUID doctorId) {
        long sent = visitRepository.countByDoctorUserIdAndWhatsappDeliveryStatusNotNull(doctorId);
        if (sent == 0)
            return 0.0;
        long read = visitRepository.countByDoctorUserIdAndWhatsappDeliveryStatus(doctorId, "READ");
        return Math.round((double) read / sent * 100.0) / 100.0;
    }
}
