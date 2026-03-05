package com.shifa.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.shifa.domain.doctor.dto.DoctorProfileResponse;
import com.shifa.domain.patient.dto.PatientSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private long expiresIn;

    private String role;
    private String userId;
    private String firstName;
    private String lastName;

    private boolean verified;

    private String message;

    private DoctorProfileResponse doctorProfile;
    private PatientSummaryResponse patientProfile;
}
