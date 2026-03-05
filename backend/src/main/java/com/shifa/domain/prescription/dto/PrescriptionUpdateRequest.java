package com.shifa.domain.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class PrescriptionUpdateRequest {

    @Size(max = 30)
    @Valid
    private List<MedicationRequest> medications;

    @Size(max = 2000)
    private String specialInstructions;

    @Size(max = 2000)
    private String dietAdvice;

    @Size(max = 2000)
    private String activityRestrictions;

    @Min(1) @Max(365)
    private Integer validityDays;

    private Boolean repeatPrescription;
}
