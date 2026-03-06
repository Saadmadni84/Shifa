package com.shifa.domain.doctor.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class DoctorProfileRequest {

    @Size(min = 2, max = 100)
    private String firstName;

    @Size(min = 2, max = 100)
    private String lastName;

    @Size(max = 100)
    private String specialization;

    @Size(max = 200)
    private String qualification;

    @Min(0) @Max(60)
    private Integer experienceYears;

    @Valid
    private ClinicRequest clinic;

    private List<String> spokenLanguages;

    @PositiveOrZero
    @Digits(integer = 7, fraction = 2)
    private BigDecimal consultationFee;

    private boolean available;
}
