package com.shifa.security.service;

import java.time.Duration;
import java.util.Date;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shifa.domain.doctor.Doctor;
import com.shifa.domain.doctor.DoctorRepository;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.domain.user.User;
import com.shifa.domain.user.UserRepository;
import com.shifa.security.audit.AuditService;
import com.shifa.security.dto.AuthRequest;
import com.shifa.security.dto.AuthResponse;
import com.shifa.security.dto.PatientRegisterRequest;
import com.shifa.security.dto.RegisterRequest;
import com.shifa.security.dto.UserPrincipal;
import com.shifa.security.jwt.JwtProperties;
import com.shifa.security.jwt.JwtService;
import com.shifa.security.jwt.JwtTokenPair;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final TokenBlacklistService blacklistService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public AuthResponse authenticateDoctor(AuthRequest request, String clientIp) {
        String identifier = request.getEmail();

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(identifier, request.getPassword()));

        User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        JwtTokenPair tokens = issueTokens(user);

        auditService.logLogin(user.getId(), clientIp, true);

        if ("DOCTOR".equals(user.getRole())) {
            Doctor doctor = null;
            try {
                doctor = doctorRepository.findByUser(user)
                        .orElseThrow(() -> new IllegalStateException("Doctor profile not found for user"));
            } catch (Exception e) {
                log.warn("Doctor profile not found for userId={}", user.getId());
            }
            log.info("[AuthService] Doctor login success: userId={}", user.getId());
            return buildDoctorAuthResponse(user, doctor, tokens);
        }

        Patient patient = null;
        try {
            patient = patientRepository.findByUser(user).orElse(null);
        } catch (Exception e) {
            log.warn("Patient profile not found for userId={}", user.getId());
        }
        log.info("[AuthService] Patient login success: userId={}", user.getId());
        return buildPatientAuthResponse(user, patient, tokens);
    }

    @Transactional
    public AuthResponse registerDoctor(RegisterRequest request, String clientIp) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("An account with this email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalStateException("An account with this phone number already exists");
        }

        // Check registration number uniqueness could be added. Skipping exact check as
        // we might need to add existsByRegistrationNumber to repo.

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("DOCTOR");
        user.setPreferredLanguage(request.getPreferredLanguage());
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setRegistrationNumber(request.getRegistrationNumber());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setClinicName(request.getClinicName());
        doctor.setClinicAddress(request.getClinicAddress());
        doctorRepository.save(doctor);

        JwtTokenPair tokens = issueTokens(user);

        auditService.logRegistration(user.getId(), clientIp);
        log.info("[AuthService] Doctor registered: userId={}", user.getId());

        return buildDoctorAuthResponse(user, doctor, tokens);
    }

    @Transactional
    public AuthResponse registerPatient(PatientRegisterRequest request, String clientIp) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("An account with this email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalStateException("An account with this phone number already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("PATIENT");
        user.setPreferredLanguage(request.getPreferredLanguage());
        user = userRepository.save(user);

        Patient patient = patientRepository.findByUser(user)
                .or(() -> patientRepository.findByPhoneNumberAndDeletedFalse(request.getPhoneNumber()))
                .orElseGet(Patient::new);

        patient.setUser(user);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhoneNumber(request.getPhoneNumber());
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            patient.setEmail(request.getEmail());
        }
        if (request.getPreferredLanguage() != null) {
            patient.setPreferredLanguage(request.getPreferredLanguage());
        }
        patient = patientRepository.save(patient);

        JwtTokenPair tokens = issueTokens(user);

        auditService.logRegistration(user.getId(), clientIp);
        log.info("[AuthService] Patient registered: userId={}", user.getId());

        return buildPatientAuthResponse(user, patient, tokens);
    }

    @Transactional
    public AuthResponse authenticatePatientByPhone(String phoneNumber, String clientIp) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> createPatientUser(phoneNumber));

        Patient patient = patientRepository.findByUser(user)
                .or(() -> patientRepository.findByPhoneNumberAndDeletedFalse(phoneNumber))
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setUser(user);
                    p.setFirstName("Patient");
                    p.setLastName("");
                    p.setPhoneNumber(phoneNumber);
                    p.setPreferredLanguage("hi");
                    return patientRepository.save(p);
                });

        if (patient.getUser() == null) {
            patient.setUser(user);
            patient = patientRepository.save(patient);
        }

        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        JwtTokenPair tokens = issueTokens(user);

        auditService.logLogin(user.getId(), clientIp, true);
        log.info("[AuthService] Patient login via OTP: userId={}", user.getId());

        return buildPatientAuthResponse(user, patient, tokens);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken, String clientIp) {
        String userId = blacklistService.consumeRefreshToken(refreshToken);
        if (userId == null) {
            throw new com.shifa.security.exception.TokenRevokedException(
                    "Refresh token is invalid or has expired. Please log in again.");
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalStateException("User not found for refresh token"));

        JwtTokenPair tokens = issueTokens(user);
        log.debug("[AuthService] Token refreshed for userId={}", userId);

        if ("DOCTOR".equals(user.getRole())) {
            Doctor doctor = null;
            try {
                doctor = doctorRepository.findByUser(user).orElse(null);
            } catch (Exception e) {
            }
            return buildDoctorAuthResponse(user, doctor, tokens);
        } else {
            Patient patient = null;
            try {
                patient = patientRepository.findByUser(user).orElse(null);
            } catch (Exception e) {
            }
            return buildPatientAuthResponse(user, patient, tokens);
        }
    }

    public void logout(String accessToken, String clientIp, UUID userId) {
        try {
            String jti = jwtService.extractJti(accessToken);
            Date expiration = jwtService.extractExpiration(accessToken);
            blacklistService.blacklist(jti, expiration);
            auditService.logLogout(userId, clientIp);
            log.info("[AuthService] Logout: userId={} jti={}", userId, jti);
        } catch (Exception e) {
            log.warn("[AuthService] Logout token parse failed (already expired?): {}", e.getMessage());
        }
    }

    private JwtTokenPair issueTokens(User user) {
        UserPrincipal userDetails = UserPrincipal.from(user);

        String accessToken = jwtService.generateAccessToken(userDetails, user.getId(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken();

        blacklistService.storeRefreshToken(
                refreshToken,
                user.getId().toString(),
                Duration.ofMillis(jwtProperties.getRefreshExpiryMs()));

        return JwtTokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessExpiresIn(jwtProperties.getExpiryMs() / 1000)
                .refreshExpiresIn(jwtProperties.getRefreshExpiryMs() / 1000)
                .build();
    }

    private User createPatientUser(String phoneNumber) {
        User user = new User();
        user.setPhoneNumber(phoneNumber);
        user.setRole("PATIENT");
        user.setPreferredLanguage("hi");
        user = userRepository.save(user);

        final User savedUser = user;
        Patient patient = patientRepository.findByPhoneNumberAndDeletedFalse(phoneNumber)
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setFirstName("Patient");
                    p.setLastName("");
                    p.setPhoneNumber(phoneNumber);
                    p.setPreferredLanguage("hi");
                    return p;
                });
        patient.setUser(savedUser);
        patientRepository.save(patient);

        return user;
    }

    private AuthResponse buildDoctorAuthResponse(User user, Doctor doctor, JwtTokenPair tokens) {
        return AuthResponse.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .accessExpiresIn(tokens.getAccessExpiresIn())
                .userId(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .displayName(doctor != null ? doctor.getFullName() : user.getEmail())
                .preferredLanguage(user.getPreferredLanguage())
                .specialization(doctor != null ? doctor.getSpecialization() : null)
                .clinicName(doctor != null ? doctor.getClinicName() : null)
                .registrationNumber(doctor != null ? doctor.getRegistrationNumber() : null)
                .build();
    }

    private AuthResponse buildPatientAuthResponse(User user, Patient patient, JwtTokenPair tokens) {
        return AuthResponse.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .accessExpiresIn(tokens.getAccessExpiresIn())
                .userId(user.getId())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .displayName(patient != null ? patient.getFullName() : user.getPhoneNumber())
                .preferredLanguage(user.getPreferredLanguage())
                .abhaId(patient != null ? patient.getAbhaId() : null)
                .build();
    }
}
