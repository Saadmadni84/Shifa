package com.shifa.domain.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class PrescriptionCreateRequest {

    @NotNull(message = "Visit ID is required")
    private UUID visitId;

    @NotEmpty(message = "At least one medication must be listed")
    @Size(max = 30, message = "Maximum 30 medications per prescription")
    @Valid
    private List<MedicationRequest> medications;

    @Size(max = 2000)
    private String specialInstructions;

    @Size(max = 2000)
    private String dietAdvice;

    @Size(max = 2000)
    private String activityRestrictions;

    @Min(1) @Max(365)
    private Integer validityDays = 30;

    private boolean repeatPrescription = false;
}
