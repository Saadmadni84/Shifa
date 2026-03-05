package com.shifa.security.otp;

import com.shifa.security.exception.OtpExpiredException;
import com.shifa.security.exception.OtpThrottledException;
import com.shifa.security.exception.InvalidOtpException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private final OtpProperties otpProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final String OTP_KEY = "shifa:otp:";
    private static final String ATTEMPTS_KEY = "shifa:otp:attempts:";
    private static final String COOLDOWN_KEY = "shifa:otp:cooldown:";

    public String generateAndStore(String phoneNumber) {
        if (Boolean.TRUE.equals(redisTemplate.hasKey(COOLDOWN_KEY + phoneNumber))) {
            Long remaining = redisTemplate.getExpire(COOLDOWN_KEY + phoneNumber);
            throw new OtpThrottledException(
                    "Please wait " + remaining + " seconds before requesting a new OTP.");
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));

        redisTemplate.opsForValue().set(
                OTP_KEY + phoneNumber,
                otp,
                Duration.ofMinutes(otpProperties.getTtlMinutes()));

        redisTemplate.opsForValue().set(
                COOLDOWN_KEY + phoneNumber,
                "1",
                Duration.ofSeconds(otpProperties.getResendCooldownSec()));

        redisTemplate.delete(ATTEMPTS_KEY + phoneNumber);

        log.info("[OtpService] OTP generated for phone={}xxxx", phoneNumber.substring(0, 6));
        return otp;
    }

    public void verifyAndConsume(String phoneNumber, String submittedOtp) {
        String attemptsStr = redisTemplate.opsForValue().get(ATTEMPTS_KEY + phoneNumber);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;

        if (attempts >= otpProperties.getMaxAttempts()) {
            throw new OtpThrottledException(
                    "Too many incorrect attempts. Please wait " +
                            otpProperties.getLockoutMinutes() + " minutes before trying again.");
        }

        String storedOtp = redisTemplate.opsForValue().get(OTP_KEY + phoneNumber);

        if (storedOtp == null) {
            throw new OtpExpiredException("OTP has expired or was never requested. Please request a new OTP.");
        }

        if (!storedOtp.equals(submittedOtp)) {
            Long newCount = redisTemplate.opsForValue().increment(ATTEMPTS_KEY + phoneNumber);
            // Defensive check for newCount, though increment usually returns non-null for
            // valid keys
            if (newCount != null) {
                if (newCount == 1) {
                    redisTemplate.expire(ATTEMPTS_KEY + phoneNumber,
                            Duration.ofMinutes(otpProperties.getLockoutMinutes()));
                }
                int remaining = otpProperties.getMaxAttempts() - newCount.intValue();
                throw new InvalidOtpException(
                        "Incorrect OTP. " + (remaining > 0 ? remaining + " attempts remaining." : "Account locked."));
            } else {
                // Handle unexpected null from increment, e.g., log and throw a generic error
                log.error("[OtpService] Redis increment returned null for ATTEMPTS_KEY: {}",
                        ATTEMPTS_KEY + phoneNumber);
                throw new InvalidOtpException("An unexpected error occurred during OTP verification.");
            }
        }

        redisTemplate.delete(OTP_KEY + phoneNumber);
        redisTemplate.delete(ATTEMPTS_KEY + phoneNumber);
        log.info("[OtpService] OTP verified for phone={}xxxx", phoneNumber.substring(0, 6));
    }
}
