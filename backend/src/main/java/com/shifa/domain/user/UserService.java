package com.shifa.domain.user;

import com.shifa.common.exception.ShifaException;
import com.shifa.domain.user.dto.AuthResponse;
import com.shifa.domain.user.dto.LoginRequest;
import com.shifa.domain.user.dto.OtpRequest;
import com.shifa.domain.user.dto.PasswordResetRequest;
import com.shifa.domain.user.dto.RegisterRequest;
import com.shifa.security.JwtService;
import com.shifa.domain.user.service.OtpService;
import com.shifa.common.enums.Language;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final ApplicationEventPublisher eventPublisher;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ShifaException("Phone number already registered");
        }

        User user = new User();
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().toUpperCase());
        user = userRepository.save(user);

        otpService.generateAndSend(user.getPhoneNumber(), Language.EN);

        // Assuming UserRegisteredEvent exists, or standard spring event handling.
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user, request));

        String token = jwtService.generateToken(user.getId().toString());
        return AuthResponse.builder()
            .accessToken(token)
            .role(user.getRole())
            .verified(false)
            .message("OTP sent to " + user.getPhoneNumber())
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhoneNumber(request.getIdentifier())
            .or(() -> userRepository.findByEmail(request.getIdentifier()))
            .orElseThrow(() -> new ShifaException("Invalid credentials"));

        checkAccountLock(user);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user);
            throw new ShifaException("Invalid credentials");
        }

        resetFailedAttempts(user);
        String token = jwtService.generateToken(user.getId().toString());
        return AuthResponse.builder().accessToken(token).role(user.getRole()).build();
    }

    private void checkAccountLock(User user) {
        if (user.getAccountLockedUntil() != null &&
            user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
            throw new ShifaException("Account locked. Try again after " +
                user.getAccountLockedUntil());
        }
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= 5) {
            user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(30));
        }
        userRepository.save(user);
    }

    private void resetFailedAttempts(User user) {
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // stub methods for verifyOtp, refreshToken, initiatePasswordReset, resetPassword
    public AuthResponse verifyOtp(OtpRequest request) { return null; }
    public AuthResponse refreshToken(String token) { return null; }
    public void initiatePasswordReset(String phoneNumber) {}
    public void resetPassword(PasswordResetRequest request) {}
}
