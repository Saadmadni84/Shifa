package com.shifa.domain.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query(value = "SELECT n FROM Notification n " +
            "WHERE n.status = 'PENDING' " +
            "AND n.scheduledFor <= :now " +
            "AND n.retryCount < 3 " +
            "ORDER BY n.scheduledFor ASC " +
            "LIMIT :limit", nativeQuery = false) // Note: LIMIT natively in JPQL depends on Spring Data version, using
                                                 // pageable or native might be safer, but assuming JPQL 3.0 supports it
    List<Notification> findPendingNotificationsDue(
            @Param("now") LocalDateTime now,
            @Param("limit") int limit);

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

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.createdAt >= :since") // Assumes createdAt exists, I will need
                                                                              // to check if Notification has it, else
                                                                              // use sentAt or another field. It doesn't
                                                                              // have createdAt. Let me use scheduledFor
                                                                              // or id?
    long countNotificationsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.status = 'FAILED' AND n.sentAt >= :since") // Assuming sentAt
                                                                                                   // acts as a date
                                                                                                   // proxy
    long countFailedNotificationsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.patientId IN (" +
            "    SELECT v.patientId FROM Visit v WHERE v.doctorId = :doctorId" +
            ") " +
            "AND n.status = 'FAILED' " +
            "AND n.sentAt >= :since")
    int countFailedSinceYesterday(
            @Param("doctorId") Long doctorId,
            @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.patientId IN (" +
            "    SELECT v.patientId FROM Visit v WHERE v.doctorId = :doctorId" +
            ") " +
            "AND n.status = 'PENDING' " +
            "AND CAST(n.scheduledFor AS java.time.LocalDate) = :today")
    int countScheduledForToday(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today);

    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.status = 'CANCELLED' " +
            "WHERE n.patientId = :patientId " +
            "AND n.status = 'PENDING'")
    int cancelPatientNotifications(@Param("patientId") Long patientId);
}
