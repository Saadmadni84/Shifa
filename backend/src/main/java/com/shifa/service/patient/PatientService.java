package com.shifa.service.patient;

import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.security.annotation.PhiAccess;
import com.shifa.service.dto.PatientCreateRequest;
import com.shifa.service.dto.PatientSearchResult;
import com.shifa.service.exception.DuplicatePatientException;
import com.shifa.service.exception.PatientNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;

    @Transactional
    public Patient createPatient(PatientCreateRequest request, UUID doctorId) {
        if (request.getPhoneNumber() != null &&
                patientRepository.existsByPhoneNumberAndDeletedFalse(request.getPhoneNumber())) {
            throw new DuplicatePatientException(
                    "A patient with phone number " + request.getPhoneNumber() + " already exists.");
        }

        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setPreferredLanguage(
                request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "hi");
        patient.setAbhaId(request.getAbhaId());
        patient.setAddress(request.getAddress());
        patient.setKnownConditions(request.getKnownConditions());
        patient.setAllergies(request.getAllergies());
        patient.setCreatedAt(LocalDateTime.now());

        Patient saved = patientRepository.save(patient);
        log.info("[PatientService] Patient created: patientId={} doctorId={}", saved.getId(), doctorId);
        return saved;
    }

    @Transactional(readOnly = true)
    @PhiAccess(action = "VIEW_PATIENT", resource = "PATIENT")
    public Patient getPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(UUID.randomUUID())); // TODO FIX parameter for ID type
    }

    @Transactional(readOnly = true)
    public Page<PatientSearchResult> searchPatients(String query, UUID doctorId, Pageable pageable) {
        Page<Patient> patients;

        if (query != null && query.matches("^[6-9]\\d{4,9}$")) {
            patients = patientRepository.findByPhoneNumberStartingWithAndDoctorId(
                    query, doctorId, pageable);
        } else {
            patients = patientRepository.searchByNameAndDoctorId(query, doctorId, pageable);
        }

        List<PatientSearchResult> results = patients.getContent().stream()
                .map(this::toSearchResult)
                .collect(Collectors.toList());

        return new PageImpl<>(results, pageable, patients.getTotalElements());
    }

    @Transactional
    @PhiAccess(action = "UPDATE_PATIENT", resource = "PATIENT")
    public Patient updatePatient(Long patientId, PatientCreateRequest request) {
        Patient patient = getPatient(patientId);

        if (request.getFirstName() != null)
            patient.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            patient.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null)
            patient.setPhoneNumber(request.getPhoneNumber());
        if (request.getPreferredLanguage() != null)
            patient.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getAge() != null)
            patient.setAge(request.getAge());
        if (request.getAbhaId() != null)
            patient.setAbhaId(request.getAbhaId());
        if (request.getKnownConditions() != null)
            patient.setKnownConditions(request.getKnownConditions());
        if (request.getAllergies() != null)
            patient.setAllergies(request.getAllergies());

        patient.setUpdatedAt(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    @Transactional
    public void deletePatient(Long patientId) {
        Patient patient = getPatient(patientId);
        patient.setDeleted(true);
        patient.setDeletedAt(LocalDateTime.now());
        patientRepository.save(patient);
        log.info("[PatientService] Patient soft-deleted: patientId={}", patientId);
    }

    private PatientSearchResult toSearchResult(Patient p) {
        return PatientSearchResult.builder()
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .phoneNumber(p.getPhoneNumber())
                .age(p.getAge())
                .gender(p.getGender())
                .preferredLanguage(p.getPreferredLanguage())
                .lastVisitDate(null)
                .build();
    }
}
