package com.shifa.common.util;

public final class LogMaskingUtils {

    private LogMaskingUtils() {
        // Prevent instantiation
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return "****";
        }
        return phone.substring(0, phone.length() - 4).replaceAll(".", "*") + phone.substring(phone.length() - 4);
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "****";
        }
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        
        if (name.length() <= 2) {
            return "**@" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }
    
    public static String maskAbhaId(String abhaId) {
        if (abhaId == null || abhaId.length() < 4) {
            return "****";
        }
        return "********" + abhaId.substring(abhaId.length() - 4);
    }
}
