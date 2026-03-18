package com.shifa.domain.doctor;

import com.shifa.common.pagination.PageResponse;
import com.shifa.domain.doctor.dto.DoctorProfileRequest;
import com.shifa.domain.doctor.dto.DoctorProfileResponse;
import com.shifa.domain.doctor.dto.DoctorStatsResponse;
import com.shifa.domain.patient.dto.PatientSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("domainDoctorService")
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorProfileResponse getProfile(String username) {
        return null; // TODO implement
    }

    public DoctorProfileResponse updateProfile(String username, DoctorProfileRequest request) {
        return null; // TODO implement
    }

    public DoctorStatsResponse getStats(String username) {
        return null; // TODO implement
    }

    public PageResponse<PatientSummaryResponse> getPatients(String username, int page, int size, String search) {
        return null; // TODO implement
    }
}
