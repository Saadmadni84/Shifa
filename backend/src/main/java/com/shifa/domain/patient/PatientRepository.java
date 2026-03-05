package com.shifa.domain.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.shifa.domain.user.User;

public interface PatientRepository extends JpaRepository<Patient, Long> {

        @Query("SELECT p FROM Patient p WHERE p.deleted = false AND p.id NOT IN " +
                        "(SELECT v.patient.id FROM Visit v WHERE v.createdAt >= :cutoff OR v.followUpDate >= :recentDate)")
        List<Patient> findInactivePatientsBeforeCutoff(@Param("cutoff") LocalDateTime cutoff,
                        @Param("recentDate") LocalDate recentDate);

        Optional<Patient> findByUser(User user);
}
