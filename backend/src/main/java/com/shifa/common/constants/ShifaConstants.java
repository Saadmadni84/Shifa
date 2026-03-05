package com.shifa.common.constants;

public final class ShifaConstants {

    private ShifaConstants() {
        // Prevent instantiation
    }

    public static final String SYSTEM_ACCOUNT = "system";
    
    // Auth Constants
    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String ROLES_CLAIM = "roles";
    
    // Timezone
    public static final String IST_TIMEZONE = "Asia/Kolkata";
    
    // Limits
    public static final int MAX_PAGE_SIZE = 100;
    public static final int DEFAULT_PAGE_SIZE = 20;

    // Cache Keys
    public static final String AI_SUMMARY_CACHE = "ai_summaries";
    public static final String PATIENT_PROFILE_CACHE = "patient_profiles";
    
    // Formatting
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
}
