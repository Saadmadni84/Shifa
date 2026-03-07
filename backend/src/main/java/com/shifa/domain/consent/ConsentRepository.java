package com.shifa.domain.consent;

import com.shifa.common.enums.ConsentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentRepository extends JpaRepository<PatientConsent, UUID> {

    Optional<PatientConsent> findFirstByPatientIdAndConsentTypeAndDeletedFalseOrderByCreatedAtDesc(
            UUID patientId,
            ConsentType type);
}
