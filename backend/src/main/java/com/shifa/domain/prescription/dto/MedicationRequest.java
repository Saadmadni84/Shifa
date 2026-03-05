package com.shifa.domain.prescription.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MedicationRequest {

    @NotBlank(message = "Medication name is required")
    @Size(max = 200)
    private String name;

    @Size(max = 200)
    private String genericName;

    @Size(max = 100)
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Size(max = 100)
    private String frequency;

    @Size(max = 200)
    private String timing;

    @Min(1) @Max(365)
    private Integer durationDays;

    @Min(1) @Max(999)
    private Integer quantity;

    @Pattern(regexp = "ORAL|TOPICAL|INHALED|IV|IM|SUBCUT|SUBLINGUAL|NASAL|OPHTHALMIC|OTIC|RECTAL",
             message = "Invalid route of administration")
    private String route = "ORAL";

    @Size(max = 1000)
    private String instructions;

    private boolean critical = false;
    private boolean needsRefrigeration = false;

    @Min(0) @Max(100)
    private Integer sortOrder = 0;
}
