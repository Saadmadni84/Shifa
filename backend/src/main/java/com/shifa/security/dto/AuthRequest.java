package com.shifa.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {

    @NotBlank(message = "Email or phone number is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
