package com.shifa.domain.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.shifa.common.enums.NotificationStatus;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

        @Query("SELECT n FROM Notification n " +
                        "WHERE n.status = :status " +
                        "AND n.scheduledFor <= :now " +
                        "AND n.retryCount < :maxRetry " +
                        "ORDER BY n.scheduledFor ASC")
        List<Notification> findPendingNotificationsDue(
                        @Param("status") NotificationStatus status,
                        @Param("now") LocalDateTime now,
                        @Param("maxRetry") int maxRetry,
                        Pageable pageable);

        Optional<Notification> findByMetaMessageId(String metaMessageId);

        @Query("SELECT COUNT(n) FROM Notification n " +
                        "WHERE n.status = 'PENDING' " +
                        "AND n.scheduledFor <= :threshold")
        int countStalePendingNotifications(@Param("threshold") LocalDateTime threshold);

        @Modifying
        @Query("UPDATE Notification n " +
                        "SET n.retryCount = 0, n.scheduledFor = CURRENT_TIMESTAMP " +
                        "WHERE n.status = 'PENDING' " +
                        "AND n.scheduledFor <= :threshold")
        int resetStalePendingNotifications(@Param("threshold") LocalDateTime threshold);

        @Query("SELECT COUNT(n) FROM Notification n WHERE n.scheduledFor >= :since")
        long countNotificationsSince(@Param("since") LocalDateTime since);

        @Query("SELECT COUNT(n) FROM Notification n WHERE n.status = 'FAILED' AND n.sentAt >= :since")
        long countFailedNotificationsSince(@Param("since") LocalDateTime since);

        @Query("SELECT COUNT(n) FROM Notification n " +
                        "WHERE n.patient.id IN (" +
                        "    SELECT v.patient.id FROM Visit v WHERE v.doctor.user.id = :doctorId" +
                        ") " +
                        "AND n.status = 'FAILED' " +
                        "AND n.sentAt >= :since")
        int countFailedSinceYesterday(
                        @Param("doctorId") UUID doctorId,
                        @Param("since") LocalDateTime since);

        @Query("SELECT COUNT(n) FROM Notification n " +
                        "WHERE n.patient.id IN (" +
                        "    SELECT v.patient.id FROM Visit v WHERE v.doctor.user.id = :doctorId" +
                        ") " +
                        "AND n.status = 'PENDING' " +
                        "AND n.scheduledFor >= :startOfDay " +
                        "AND n.scheduledFor < :endOfDay")
        int countScheduledForToday(
                        @Param("doctorId") UUID doctorId,
                        @Param("startOfDay") LocalDateTime startOfDay,
                        @Param("endOfDay") LocalDateTime endOfDay);

        @Modifying
        @Transactional
        @Query("UPDATE Notification n SET n.status = :status WHERE n.externalMessageId = :externalId")
        int updateStatusByExternalId(@Param("externalId") String externalId,
                        @Param("status") com.shifa.common.enums.NotificationStatus status);

        @Modifying
        @Query("UPDATE Notification n " +
                        "SET n.status = 'CANCELLED' " +
                        "WHERE n.patient.id = :patientId " +
                        "AND n.status = 'PENDING'")
        int cancelPatientNotifications(@Param("patientId") UUID patientId);
}
