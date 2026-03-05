package com.shifa.domain.visit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.shifa.domain.prescription.dto.MedicationResponse;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VisitPatientResponse {

    String visitId;
    LocalDate visitDate;

    String doctorName;
    String doctorSpecialization;
    String clinicName;
    String clinicPhone;

    String patientFirstName;
    String preferredLanguage;

    String summaryText;

    String diagnosis;
    List<MedicationResponse> medications;
    List<String> dietaryAdvice;
    List<String> activityRestrictions;
    List<String> redFlags;
    List<String> testsOrdered;
    String doctorInstructions;

    LocalDate followUpDate;
    Integer followUpInDays;
    String followUpNotes;

    boolean chatEnabled;
    boolean portalAccessValid;
}
