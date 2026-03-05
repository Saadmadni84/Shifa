package com.shifa.domain.consent;

import com.shifa.common.enums.ConsentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentRepository extends JpaRepository<PatientConsent, UUID> {
    
    @Query("""
        SELECT c FROM PatientConsent c
        WHERE c.patient.id = :patientId
        AND c.consentType = :type
        AND c.deleted = false
        ORDER BY c.createdAt DESC
        LIMIT 1
        """)
    Optional<PatientConsent> findLatestByPatientIdAndType(UUID patientId, ConsentType type);
}
