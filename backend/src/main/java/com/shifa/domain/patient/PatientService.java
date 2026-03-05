package com.shifa.domain.patient;

import com.shifa.common.pagination.PageResponse;
import com.shifa.domain.patient.dto.PatientCreateRequest;
import com.shifa.domain.patient.dto.PatientResponse;
import com.shifa.domain.patient.dto.PatientUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientResponse createPatient(PatientCreateRequest request) {
        return null; // TODO implement
    }

    public PatientResponse updatePatient(java.util.UUID id, PatientUpdateRequest request) {
        return null; // TODO implement
    }

    public PatientResponse getPatient(java.util.UUID id) {
        return null; // TODO implement
    }

    public PageResponse<PatientResponse> searchPatients(String query, int page, int size) {
        return null; // TODO implement
    }
}
