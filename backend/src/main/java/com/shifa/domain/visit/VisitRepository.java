package com.shifa.domain.visit;

import com.shifa.common.enums.VisitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VisitRepository extends JpaRepository<Visit, UUID> {

    Optional<Visit> findByIdAndDeletedFalse(UUID id);

    Optional<Visit> findByPatientPortalToken(String token);

    Optional<Visit> findByIdAndDoctorIdAndDeletedFalse(UUID visitId, UUID doctorId);

    @Modifying
    @Query("UPDATE Visit v SET v.whatsappStatus = :status WHERE v.whatsappMessageId = :messageId")
    void updateWhatsAppStatus(@Param("messageId") String messageId, @Param("status") WhatsAppStatus status);

    @Query("""
        SELECT v FROM Visit v
        JOIN FETCH v.patient p
        WHERE v.doctor.id = :doctorId
        AND v.deleted = false
        AND (:status IS NULL OR v.status = :status)
        ORDER BY v.visitDate DESC, v.createdAt DESC
        """)
    Page<Visit> findByDoctorId(
        @Param("doctorId") UUID doctorId,
        @Param("status") VisitStatus status,
        Pageable pageable);

    @Query("""
        SELECT v FROM Visit v
        WHERE v.patient.id = :patientId
        AND v.deleted = false
        ORDER BY v.visitDate DESC
        """)
    Page<Visit> findByPatientId(@Param("patientId") UUID patientId, Pageable pageable);

    @Query("""
        SELECT v FROM Visit v
        WHERE v.followUpDate = :today
        AND v.status = 'COMPLETED'
        AND v.deleted = false
        """)
    List<Visit> findFollowUpsDueOn(@Param("today") LocalDate today);

    @Query("""
        SELECT COUNT(v) FROM Visit v
        WHERE v.doctor.id = :doctorId
        AND v.visitDate = :today
        AND v.deleted = false
        """)
    long countTodaysVisits(@Param("doctorId") UUID doctorId, @Param("today") LocalDate today);

    @Query("""
        SELECT v FROM Visit v
        WHERE v.status = 'AI_PROCESSING'
        AND v.updatedAt < :cutoff
        AND v.deleted = false
        """)
    List<Visit> findStuckAIProcessingVisits(@Param("cutoff") LocalDateTime cutoff);
}
