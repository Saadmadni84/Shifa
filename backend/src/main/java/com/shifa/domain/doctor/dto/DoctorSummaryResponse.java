package com.shifa.domain.doctor.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorSummaryResponse {
    String id;
    String fullName;
    String specialization;
    String clinicName;
    String profilePhotoUrl;
}
