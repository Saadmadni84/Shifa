package com.shifa.domain.user.dto;

import com.shifa.common.validation.annotations.IndianPhone;
import com.shifa.common.validation.annotations.StrongPassword;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
public class PasswordResetRequest {

    @NotBlank
    @IndianPhone
    private String phoneNumber;

    @NotBlank(message = "OTP is required")
    @Size(min = 4, max = 6)
    private String otp;

    @NotBlank(message = "New password is required")
    @StrongPassword
    private String newPassword;

    @NotBlank
    private String confirmPassword;

    @AssertTrue(message = "Passwords do not match")
    @JsonIgnore
    public boolean isPasswordMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
