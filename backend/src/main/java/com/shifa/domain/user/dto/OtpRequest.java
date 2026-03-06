package com.shifa.domain.user.dto;

import com.shifa.common.validation.annotations.IndianPhone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OtpRequest {

    @NotBlank(message = "Phone number is required")
    @IndianPhone
    private String phoneNumber;

    @NotBlank(message = "OTP is required")
    @Size(min = 4, max = 6, message = "OTP must be 4–6 digits")
    @Pattern(regexp = "\\d+", message = "OTP must contain digits only")
    private String otp;
}
