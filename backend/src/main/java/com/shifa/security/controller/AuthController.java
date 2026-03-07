package com.shifa.security.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.shifa.integration.whatsapp.WhatsAppService;
import com.shifa.security.annotation.CurrentUser;
import com.shifa.security.dto.AuthRequest;
import com.shifa.security.dto.AuthResponse;
import com.shifa.security.dto.OtpRequest;
import com.shifa.security.dto.OtpVerifyRequest;
import com.shifa.security.dto.PatientRegisterRequest;
import com.shifa.security.dto.RegisterRequest;
import com.shifa.security.dto.UserPrincipal;
import com.shifa.security.otp.OtpService;
import com.shifa.security.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController("securityAuthController")
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final WhatsAppService whatsAppService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @RequestBody @Valid RegisterRequest request,
            HttpServletRequest httpRequest) {
        return authService.registerDoctor(request, getClientIp(httpRequest));
    }

    @PostMapping("/register/patient")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerPatient(
            @RequestBody @Valid PatientRegisterRequest request,
            HttpServletRequest httpRequest) {
        return authService.registerPatient(request, getClientIp(httpRequest));
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody @Valid AuthRequest request,
            HttpServletRequest httpRequest) {
        return authService.authenticateDoctor(request, getClientIp(httpRequest));
    }

    @PostMapping("/patient/otp/request")
    public ResponseEntity<Map<String, String>> requestOtp(
            @RequestBody @Valid OtpRequest request) {
        String otp = otpService.generateAndStore(request.getPhoneNumber());
        whatsAppService.sendOTP(request.getPhoneNumber(), otp);
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your WhatsApp number. Valid for 5 minutes.",
                "phoneNumber", maskPhone(request.getPhoneNumber())));
    }

    @PostMapping("/patient/otp/verify")
    public AuthResponse verifyOtp(
            @RequestBody @Valid OtpVerifyRequest request,
            HttpServletRequest httpRequest) {
        otpService.verifyAndConsume(request.getPhoneNumber(), request.getOtp());
        return authService.authenticatePatientByPhone(
                request.getPhoneNumber(),
                getClientIp(httpRequest));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(
            @RequestBody Map<String, String> body,
            HttpServletRequest httpRequest) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("refreshToken is required");
        }
        return authService.refreshToken(refreshToken, getClientIp(httpRequest));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @CurrentUser UserPrincipal currentUser,
            HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token, getClientIp(httpRequest), currentUser.getUserId());
        }
    }

    @GetMapping("/me")
    public UserPrincipal me(@CurrentUser UserPrincipal currentUser) {
        return currentUser;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String maskPhone(String phone) {
        return phone.substring(0, 5) + "xxxxx";
    }
}
