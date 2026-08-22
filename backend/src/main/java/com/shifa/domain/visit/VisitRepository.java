package com.shifa.domain.visit;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.shifa.common.enums.WhatsAppStatus;


public interface VisitRepository extends JpaRepository<Visit, UUID> {

    // Portal token methods
    Optional<Visit> findByPatientPortalToken(String token);
    List<Visit> findByPatientId(UUID patientId);
    List<Visit> findByPatientIdOrderByVisitDateDesc(UUID patientId);

        @Query("SELECT v.id, v.visitDate, v.visitType, v.status, v.chiefComplaint, v.rawNotes "
            + "FROM Visit v WHERE v.patient.id = :patientId ORDER BY v.visitDate DESC")
        List<Object[]> findPatientVisitSummaries(@Param("patientId") UUID patientId);

    @Query("SELECT v.patient.id FROM Visit v WHERE v.id = :visitId")
    Optional<UUID> findPatientIdById(@Param("visitId") UUID visitId);



    // Doctor-based queries using UUID
    Page<Visit> findByDoctorUserIdAndDeletedFalse(UUID doctorUserId, Pageable pageable);

    Page<Visit> findByPatientIdAndDoctorUserIdAndDeletedFalse(UUID patientId, UUID doctorUserId, Pageable pageable);

    @Query("SELECT v FROM Visit v WHERE v.id = :visitId")
    Optional<Visit> findAIStatusById(@Param("visitId") UUID visitId);

    // Stats queries
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND DATE(v.visitDate) = :date AND v.deleted = false")
    long countByDoctorUserIdAndVisitDate(@Param("doctorUserId") UUID doctorUserId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.visitDate > :date AND v.deleted = false")
    long countByDoctorUserIdAndVisitDateAfter(@Param("doctorUserId") UUID doctorUserId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT v.patient.id) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.visitDate >= :since AND v.deleted = false")
    long countNewPatientsByDoctorSince(@Param("doctorUserId") UUID doctorUserId, @Param("since") LocalDate since);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.status = :status AND v.deleted = false")
    long countByDoctorUserIdAndStatus(@Param("doctorUserId") UUID doctorUserId, @Param("status") VisitStatus status);

    @Query("SELECT COUNT(DISTINCT v.patient.id) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.deleted = false")
    long countDistinctPatientsByDoctorUserId(@Param("doctorUserId") UUID doctorUserId);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.deleted = false")
    long countByDoctorUserIdAndDeletedFalse(@Param("doctorUserId") UUID doctorUserId);

    @Query("SELECT v.patient.preferredLanguage, COUNT(v) as cnt FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.patient.preferredLanguage IS NOT NULL AND v.deleted = false GROUP BY v.patient.preferredLanguage ORDER BY cnt DESC")
    List<Object[]> findTopPatientLanguageByDoctorUserId(@Param("doctorUserId") UUID doctorUserId);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.whatsappStatus IS NOT NULL AND v.deleted = false")
    long countByDoctorUserIdAndWhatsappDeliveryStatusNotNull(@Param("doctorUserId") UUID doctorUserId);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.whatsappStatus = :status AND v.deleted = false")
    long countByDoctorUserIdAndWhatsappDeliveryStatus(@Param("doctorUserId") UUID doctorUserId, @Param("status") WhatsAppStatus status);

    // Legacy queries (keeping for backward compatibility)
    List<Visit> findByFollowUpDate(LocalDate followUpDate);

    @Query("SELECT v FROM Visit v " +
            "WHERE v.followUpDate = :missedDate " +
            "AND v.deleted = false " +
            "AND NOT EXISTS (" +
            "    SELECT 1 FROM Visit v2 " +
            "    WHERE v2.patient.id = v.patient.id " +
            "    AND v2.visitDate > v.visitDate" +
            ")")
    List<Visit> findMissedFollowUps(@Param("missedDate") LocalDate missedDate);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.followUpDate = :date AND v.deleted = false")
    long countFollowUpsByDoctorAndDate(@Param("doctorUserId") UUID doctorUserId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctor.user.id = :doctorUserId AND v.status = 'DRAFT' AND v.deleted = false")
    long countDraftVisitsByDoctor(@Param("doctorUserId") UUID doctorUserId);

    @Modifying
    @Transactional
    @Query("UPDATE Visit v SET v.whatsappStatus = :status WHERE v.whatsappMessageId = :externalId")
    int updateWhatsAppStatus(@Param("externalId") String externalId, @Param("status") com.shifa.common.enums.WhatsAppStatus status);
}
