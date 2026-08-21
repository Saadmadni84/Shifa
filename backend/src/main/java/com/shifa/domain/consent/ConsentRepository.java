package com.shifa.domain.consent;

import com.shifa.common.enums.ConsentType;
import org.springframework.data.keyvalue.repository.KeyValueRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentRepository extends KeyValueRepository<PatientConsent, String> {

    Optional<PatientConsent> findFirstByPatientIdAndConsentTypeAndDeletedFalseOrderByCreatedAtDesc(
            UUID patientId,
            ConsentType type);
}
