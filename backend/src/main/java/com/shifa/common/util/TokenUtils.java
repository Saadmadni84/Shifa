package com.shifa.common.util;

import java.security.SecureRandom;
import java.util.Base64;

public final class TokenUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private TokenUtils() {
        // Prevent instantiation
    }

    public static String generateSecureToken(int length) {
        byte[] buffer = new byte[length];
        SECURE_RANDOM.nextBytes(buffer);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
    }
    
    public static String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000); // 6 digit OTP
        return String.valueOf(otp);
    }
}
