package com.shifa.domain.patient;

import com.shifa.common.pagination.PageResponse;
import com.shifa.domain.patient.dto.PatientCreateRequest;
import com.shifa.domain.patient.dto.PatientMapper;
import com.shifa.domain.patient.dto.PatientResponse;
import com.shifa.domain.patient.dto.PatientUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

@Service("domainPatientService")
@Transactional
@Slf4j
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    public PatientResponse createPatient(PatientCreateRequest request) {
        if (patientRepository.existsByPhoneNumberAndDeletedFalse(request.getPhoneNumber())) {
            throw new IllegalStateException("A patient with this phone number already exists");
        }

        Patient patient = patientMapper.toEntity(request);
        if (request.getPreferredLanguage() != null) {
            patient.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getAllergies() != null) {
            patient.setAllergies(new ArrayList<>(request.getAllergies()));
        }
        if (request.getChronicConditions() != null) {
            patient.setChronicConditions(new ArrayList<>(request.getChronicConditions()));
        }

        Patient saved = patientRepository.save(patient);
        return patientMapper.toResponse(saved);
    }

    public PatientResponse updatePatient(UUID id, PatientUpdateRequest request) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        if (request.getFirstName() != null) patient.setFirstName(request.getFirstName());
        if (request.getLastName() != null) patient.setLastName(request.getLastName());
        if (request.getEmail() != null) patient.setEmail(request.getEmail());
        if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) patient.setGender(com.shifa.common.enums.Gender.valueOf(request.getGender().toUpperCase(Locale.ROOT)));
        if (request.getAbhaId() != null) patient.setAbhaId(request.getAbhaId());
        if (request.getPreferredLanguage() != null) patient.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getCity() != null) patient.setCity(request.getCity());
        if (request.getState() != null) patient.setState(request.getState());
        if (request.getPincode() != null) patient.setPincode(request.getPincode());
        if (request.getBloodGroup() != null) patient.setBloodGroup(request.getBloodGroup());
        if (request.getEmergencyContactPhone() != null) patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getEmergencyContactName() != null) patient.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getAllergies() != null) patient.setAllergies(new ArrayList<>(request.getAllergies()));
        if (request.getChronicConditions() != null) patient.setChronicConditions(new ArrayList<>(request.getChronicConditions()));

        Patient saved = patientRepository.save(patient);
        return patientMapper.toResponse(saved);
    }

    public PatientResponse getPatient(UUID id) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        return patientMapper.toResponse(patient);
    }

    public PatientResponse getPatientProfileByUserId(UUID userId) {
        Patient patient = patientRepository.findAll().stream()
            .filter(p -> p.getUser() != null && userId.equals(p.getUser().getId()))
            .findFirst()
            .orElseGet(() -> {
                Patient p = new Patient();
                p.setFirstName("Patient");
                p.setLastName("");
                p.setPreferredLanguage("hi");
                return patientRepository.save(p);
            });
        return patientMapper.toResponse(patient);
    }

    public PatientResponse updatePatientProfileByUserId(UUID userId, PatientUpdateRequest request) {
        Patient patient = patientRepository.findAll().stream()
            .filter(p -> p.getUser() != null && userId.equals(p.getUser().getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
        return updatePatient(patient.getId(), request);
    }

    public PageResponse<PatientResponse> searchPatients(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Patient> result;
        if (query == null || query.isBlank()) {
            result = patientRepository.findByDeletedFalse(pageable);
        } else {
            result = patientRepository.searchByNameOrPhoneAndDeletedFalse(query.trim(), pageable);
        }
        return PageResponse.of(result.map(patientMapper::toResponse));
    }
}
