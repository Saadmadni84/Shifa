package com.shifa.common.util;

public final class PhoneUtils {

    private PhoneUtils() {
        // Prevent instantiation
    }

    public static String normalizeToE164(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        
        String cleanPhone = phone.replaceAll("[^\\d+]", "");
        
        if (cleanPhone.startsWith("+91")) {
            return cleanPhone;
        } else if (cleanPhone.startsWith("91") && cleanPhone.length() == 12) {
            return "+" + cleanPhone;
        } else if (cleanPhone.startsWith("0") && cleanPhone.length() == 11) {
            return "+91" + cleanPhone.substring(1);
        } else if (cleanPhone.length() == 10) {
            return "+91" + cleanPhone;
        }
        
        return cleanPhone; // Fallback
    }
}
