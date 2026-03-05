package com.shifa.domain.doctor.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorProfileResponse {

    String id;
    String firstName;
    String lastName;
    String fullName;
    String specialization;
    String qualification;
    String registrationNumber;
    Integer experienceYears;
    String profilePhotoUrl;
    BigDecimal consultationFee;
    boolean available;
    List<String> spokenLanguages;

    ClinicResponse clinic;

    LocalDateTime createdAt;
    int totalPatients;
    int totalVisits;
}
