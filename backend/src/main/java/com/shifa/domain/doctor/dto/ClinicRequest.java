package com.shifa.domain.doctor.dto;

import com.shifa.common.validation.annotations.IndianPhone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ClinicRequest {

    @NotBlank(message = "Clinic name is required")
    @Size(max = 200)
    private String name;

    @Size(max = 1000)
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100)
    private String state;

    @Pattern(regexp = "\\d{6}", message = "Pincode must be exactly 6 digits")
    private String pincode;

    @IndianPhone
    private String phone;

    @Size(max = 200, message = "Timing must be under 200 characters")
    private String timing;
}
