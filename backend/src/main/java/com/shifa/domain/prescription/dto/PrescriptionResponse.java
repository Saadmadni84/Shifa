package com.shifa.domain.prescription.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrescriptionResponse {

    String id;
    String visitId;
    List<MedicationResponse> medications;
    String specialInstructions;
    String dietAdvice;
    String activityRestrictions;
    Integer validityDays;
    boolean repeatPrescription;
    String documentUrl;
    String documentOcrText;
    LocalDateTime createdAt;
}
