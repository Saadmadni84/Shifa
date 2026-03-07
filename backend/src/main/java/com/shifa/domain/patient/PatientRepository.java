package com.shifa.domain.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.shifa.domain.user.User;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

        Page<Patient> findByDeletedFalse(Pageable pageable);

        @Query("SELECT p FROM Patient p WHERE p.deleted = false AND (" +
                        "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "p.phoneNumber LIKE CONCAT('%', :query, '%'))")
        Page<Patient> searchByNameOrPhoneAndDeletedFalse(@Param("query") String query, Pageable pageable);

        @Query("SELECT p FROM Patient p WHERE p.deleted = false AND p.id NOT IN " +
                        "(SELECT v.patient.id FROM Visit v WHERE v.createdAt >= :cutoff OR v.followUpDate >= :recentDate)")
        List<Patient> findInactivePatientsBeforeCutoff(@Param("cutoff") LocalDateTime cutoff,
                        @Param("recentDate") LocalDate recentDate);

        Optional<Patient> findByUser(User user);

        boolean existsByPhoneNumberAndDeletedFalse(String phoneNumber);

        @Query("SELECT p FROM Patient p WHERE p.phoneNumber LIKE CONCAT(:prefix, '%') AND p.deleted = false AND EXISTS (SELECT v FROM Visit v WHERE v.patient.id = p.id AND v.doctor.user.id = :doctorId)")
        Page<Patient> findByPhoneNumberStartingWithAndDoctorId(@Param("prefix") String prefix, @Param("doctorId") UUID doctorId, Pageable pageable);

        @Query("SELECT p FROM Patient p WHERE (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%'))) AND p.deleted = false AND EXISTS (SELECT v FROM Visit v WHERE v.patient.id = p.id AND v.doctor.user.id = :doctorId)")
        Page<Patient> searchByNameAndDoctorId(@Param("name") String name, @Param("doctorId") UUID doctorId, Pageable pageable);
}
