package com.shifa.domain.doctor.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class DoctorRegisterRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 100)
    private String lastName;

    @NotBlank
    @Size(max = 50, message = "MCI/State council registration number required")
    private String registrationNumber;

    @NotBlank
    @Size(max = 100)
    private String specialization;

    @Size(max = 200)
    private String qualification;

    @Min(value = 0)
    @Max(value = 60)
    private Integer experienceYears;

    @Valid
    private ClinicRequest clinic;

    private List<String> spokenLanguages = List.of("HI", "EN");

    @Digits(integer = 7, fraction = 2, message = "Invalid consultation fee")
    @PositiveOrZero
    private BigDecimal consultationFee;
}
