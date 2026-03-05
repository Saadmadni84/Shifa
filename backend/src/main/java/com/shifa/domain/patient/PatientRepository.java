package com.shifa.domain.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByPhoneNumber(String phoneNumber);

    Optional<Patient> findByAbhaId(String abhaId);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("""
        SELECT p FROM Patient p
        WHERE (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
            OR p.phoneNumber LIKE CONCAT('%', :query, '%'))
        AND p.deleted = false
        ORDER BY p.lastName, p.firstName
        """)
    Page<Patient> searchPatients(@Param("query") String query, Pageable pageable);

    @Query("""
        SELECT p FROM Patient p
        JOIN p.doctors d
        WHERE d.id = :doctorId AND p.deleted = false
        ORDER BY p.lastName
        """)
    Page<Patient> findByDoctorId(@Param("doctorId") UUID doctorId, Pageable pageable);

    @Query("""
        SELECT DISTINCT p FROM Patient p
        JOIN p.visits v
        WHERE v.visitDate >= :since AND v.status = 'COMPLETED' AND p.deleted = false
        """)
    List<Patient> findRecentlyTreatedPatients(@Param("since") LocalDate since);
}
