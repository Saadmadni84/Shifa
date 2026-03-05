package com.shifa.domain.prescription.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedicationResponse {

    String id;
    String name;
    String genericName;
    String dosage;
    String frequency;
    String timing;
    Integer durationDays;
    Integer quantity;
    String route;
    String instructions;
    String purpose;
    List<String> sideEffectsToWatch;
    boolean needsRefrigeration;
    boolean critical;
    Integer sortOrder;
    String scheduleText;
}
