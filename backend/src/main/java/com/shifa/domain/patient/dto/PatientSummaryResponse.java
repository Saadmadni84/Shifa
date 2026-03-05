package com.shifa.domain.patient.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;
import java.time.LocalDate;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientSummaryResponse {

    String id;
    String fullName;
    String phoneNumber;
    String preferredLanguage;
    int age;
    String city;
    int totalVisits;
    LocalDate lastVisitDate;
    String lastDiagnosis;
    boolean hasChronicConditions;
}
