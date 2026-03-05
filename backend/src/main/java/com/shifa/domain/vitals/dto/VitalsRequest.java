package com.shifa.domain.vitals.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class VitalsRequest {

    @Min(60) @Max(250)
    private Integer bpSystolic;

    @Min(40) @Max(150)
    private Integer bpDiastolic;

    @Min(30) @Max(250)
    private Integer pulseRate;

    @DecimalMin("35.0") @DecimalMax("42.0")
    private BigDecimal temperature;

    @Min(8) @Max(40)
    private Integer respiratoryRate;

    @Min(70) @Max(100)
    private Integer spo2;

    @DecimalMin("10.0") @DecimalMax("300.0")
    private BigDecimal weightKg;

    @DecimalMin("50.0") @DecimalMax("250.0")
    private BigDecimal heightCm;

    @DecimalMin("50.0") @DecimalMax("700.0")
    private BigDecimal bloodSugarFasting;

    @DecimalMin("50.0") @DecimalMax("700.0")
    private BigDecimal bloodSugarRandom;

    @Size(max = 1000)
    private String notes;
}
