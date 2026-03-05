package com.shifa.common.enums;

public enum ConsentType {
    DATA_PROCESSING,        // Core data processing consent (mandatory)
    WHATSAPP_COMMUNICATIONS, // WhatsApp marketing/health messages
    AI_ANALYSIS,            // AI processing of medical notes
    SHARE_WITH_DOCTOR,      // Share history with new doctors
    DATA_RETENTION,         // Extended data retention beyond legal minimum
    RESEARCH_ANONYMIZED     // Anonymous research use
}
