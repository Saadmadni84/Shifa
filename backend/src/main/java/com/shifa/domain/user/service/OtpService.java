package com.shifa.domain.user.service;

import com.shifa.common.enums.Language;
import com.shifa.domain.user.exception.InvalidOtpException;
import com.shifa.domain.user.exception.OtpRateLimitException;
import com.shifa.integration.sms.SmsService;
import com.shifa.integration.whatsapp.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    private final RedisTemplate<String, String> redis;
    private final WhatsAppService whatsAppService;
    private final SmsService smsService;

    private static final Duration OTP_TTL    = Duration.ofMinutes(5);
    private static final Duration RATE_WIN   = Duration.ofHours(1);
    private static final int MAX_REQUESTS    = 5;   // per phone per hour
    private static final int MAX_ATTEMPTS    = 5;   // wrong guesses before invalidation

    private static final String CODE_PFX    = "otp:code:";
    private static final String ATTEMPT_PFX = "otp:attempts:";
    private static final String RATE_PFX    = "otp:rate:";

    public void generateAndSend(String phone, Language lang) {
        enforceRateLimit(phone);
        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        redis.opsForValue().set(CODE_PFX + phone, otp, OTP_TTL);
        redis.delete(ATTEMPT_PFX + phone);

        try {
            whatsAppService.sendOtp(phone, otp, lang);
            log.info("[OTP] Sent via WhatsApp. phone={}", phone);
        } catch (Exception e) {
            log.warn("[OTP] WhatsApp failed. Trying SMS. phone={}", phone);
            smsService.sendOtp(phone, otp, lang);
        }
    }

    public boolean verify(String phone, String submitted) {
        String stored = redis.opsForValue().get(CODE_PFX + phone);
        if (stored == null) throw new InvalidOtpException("OTP expired. Request a new one.");

        Long attempts = redis.opsForValue().increment(ATTEMPT_PFX + phone);
        redis.expire(ATTEMPT_PFX + phone, OTP_TTL);

        if (attempts != null && attempts > MAX_ATTEMPTS) {
            redis.delete(CODE_PFX + phone);
            throw new InvalidOtpException("Too many failed attempts. Request a new OTP.");
        }

        if (!stored.equals(submitted)) {
            log.warn("[OTP] Wrong code. phone={}, attempt={}", phone, attempts);
            return false;
        }

        redis.delete(CODE_PFX + phone);
        redis.delete(ATTEMPT_PFX + phone);
        log.info("[OTP] Verified. phone={}", phone);
        return true;
    }

    private void enforceRateLimit(String phone) {
        String key = RATE_PFX + phone;
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) redis.expire(key, RATE_WIN);
        if (count != null && count > MAX_REQUESTS)
            throw new OtpRateLimitException("Too many OTP requests. Wait before retrying.");
    }
}
