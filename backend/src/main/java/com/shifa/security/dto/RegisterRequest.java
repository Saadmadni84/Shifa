package com.shifa.security.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String phoneNumber;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Password must contain uppercase, lowercase, number, and special character")
    private String password;

    @NotBlank
    private String confirmPassword;

    @NotBlank
    @Size(min = 5, max = 20, message = "Enter a valid Medical Council registration number")
    private String registrationNumber;

    @NotBlank
    private String specialization;

    @NotBlank
    @Size(max = 200)
    private String clinicName;

    @Size(max = 200)
    private String clinicAddress;

    private String preferredLanguage = "hi";
}
