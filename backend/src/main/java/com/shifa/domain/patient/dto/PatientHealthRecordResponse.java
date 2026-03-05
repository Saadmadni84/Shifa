package com.shifa.domain.patient.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.shifa.domain.visit.dto.VisitListResponse;
import com.shifa.domain.vitals.dto.VitalsResponse;
import lombok.Builder;
import lombok.Value;
import java.time.LocalDate;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientHealthRecordResponse {

    String patientId;
    String fullName;
    int age;
    String bloodGroup;
    String abhaId;

    List<String> allergies;
    List<String> chronicConditions;

    List<ActiveMedicationDTO> currentMedications;

    List<VitalsResponse> vitalHistory;

    List<VisitListResponse> recentVisits;

    boolean hasDiabetes;
    boolean hasHypertension;
    boolean hasHeartCondition;

    @Value @Builder
    public static class ActiveMedicationDTO {
        String medicationName;
        String dosage;
        String frequency;
        String timing;
        LocalDate prescribedOn;
        LocalDate expiresOn;
        boolean critical;
    }
}
