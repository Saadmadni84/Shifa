package com.shifa.security.dto;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class AuthResponse {

    String accessToken;
    String refreshToken;
    long accessExpiresIn;

    UUID userId;
    String email;
    String phoneNumber;
    String role;
    String displayName;
    String preferredLanguage;

    String specialization;
    String clinicName;
    String registrationNumber;

    String abhaId;
}
