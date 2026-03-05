package com.shifa.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.shifa.domain.doctor.dto.DoctorProfileResponse;
import com.shifa.domain.patient.dto.PatientSummaryResponse;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CurrentUserResponse {

    String id;
    String email;
    String phoneNumber;
    String role;
    boolean verified;
    boolean active;
    LocalDateTime lastLoginAt;

    DoctorProfileResponse doctorProfile;
    PatientSummaryResponse patientProfile;
}
