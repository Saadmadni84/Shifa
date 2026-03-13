// VisitDetailDto
// backend/src/main/java/com/shifa/dto/VisitDetailDto.java
package com.shifa.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class VisitDetailDto {

    // ── Core ──────────────────────────────────────────────────────────────
    private String id;
    private String patientId;
    private String date;            // "2026-03-05"
    private String type;            // "Follow-up", "Consultation", "Emergency OPD"
    private String doctor;
    private String diagnosis;
    private String chiefComplaint;
    private String clinicalNotes;
    private String instructions;
    private String followUpDate;

    // ── Vitals at visit ───────────────────────────────────────────────────
    private VitalsDto vitals;

    // ── Prescriptions ─────────────────────────────────────────────────────
    private List<PrescriptionDto> prescriptions;

    // ── WhatsApp summary ──────────────────────────────────────────────────
    private WhatsAppSummaryDto whatsappSummary;

    // ── Nested DTOs ───────────────────────────────────────────────────────

    @Data @Builder
    public static class VitalsDto {
        private String bp;         // "148/94"
        private String sugar;      // "138 mg/dL"
        private String pulse;      // "82 bpm"
        private String weight;     // "78 kg"
        private String spo2;       // "94%" — optional
    }

    @Data @Builder
    public static class PrescriptionDto {
        private String name;       // "Tab. Metoprolol 25mg"
        private String sig;        // "1-0-0 (After breakfast)"
        private String duration;   // "30 days"
        private int refills;
    }

    @Data @Builder
    public static class WhatsAppSummaryDto {
        private boolean sent;
        private String language;
        private String status;     // "Delivered" | "Read" | "Failed"
        private String timestamp;  // ISO-8601
        private String preview;    // Full message text (multilingual)
    }
}


// ────────────────────────────────────────────────────────────────────────────
// VisitSummaryDto — lightweight version for lists
// ────────────────────────────────────────────────────────────────────────────
/*
package com.shifa.dto;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class VisitSummaryDto {
    private String id;
    private String patientId;
    private String date;
    private String type;
    private String doctor;
    private String diagnosis;
    private String chiefComplaint;
    private String instructions;
    private VisitDetailDto.WhatsAppSummaryDto whatsappSummary;
    private VisitDetailDto.VitalsDto vitals;
    private String followUpDate;
}
*/
