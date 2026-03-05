package com.shifa.domain.user.dto;

import com.shifa.common.validation.annotations.IndianPhone;
import com.shifa.common.validation.annotations.StrongPassword;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be 2–100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100)
    private String lastName;

    @IndianPhone
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @StrongPassword
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    @NotNull(message = "Role is required")
    @Pattern(regexp = "DOCTOR|PATIENT|RECEPTIONIST",
             message = "Role must be DOCTOR, PATIENT, or RECEPTIONIST")
    private String role;

    @Size(max = 50, message = "Registration number must be under 50 characters")
    private String registrationNumber;

    @Size(max = 100)
    private String specialization;

    @AssertTrue(message = "Passwords do not match")
    @JsonIgnore
    public boolean isPasswordMatch() {
        return password != null && password.equals(confirmPassword);
    }
}
