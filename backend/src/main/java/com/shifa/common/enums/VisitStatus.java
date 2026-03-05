package com.shifa.common.enums;

public enum VisitStatus {
    DRAFT,              // Visit created, no notes yet
    NOTES_TAKEN,        // Doctor has entered notes
    AI_PROCESSING,      // Claude is processing (async)
    AI_COMPLETE,        // AI done, waiting for doctor review
    REVIEWED,           // Doctor has reviewed AI summary
    SENT_TO_PATIENT,    // WhatsApp sent
    COMPLETED,          // Patient has read the summary
    CANCELLED           // Visit cancelled
}
