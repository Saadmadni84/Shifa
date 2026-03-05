package com.shifa.domain.visit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface VisitRepository extends JpaRepository<Visit, Long> {

    List<Visit> findByFollowUpDate(LocalDate followUpDate);

    @Query("SELECT v FROM Visit v " +
            "WHERE v.followUpDate = :missedDate " +
            "AND v.deleted = false " +
            "AND NOT EXISTS (" +
            "    SELECT 1 FROM Visit v2 " +
            "    WHERE v2.patientId = v.patientId " +
            "    AND v2.visitAt > v.visitAt" +
            ")")
    List<Visit> findMissedFollowUps(@Param("missedDate") LocalDate missedDate);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctorId = :doctorId AND v.followUpDate = :date AND v.deleted = false")
    int countFollowUpsByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.doctorId = :doctorId AND v.status = 'DRAFT' AND v.deleted = false")
    int countDraftVisitsByDoctor(@Param("doctorId") Long doctorId);
}
