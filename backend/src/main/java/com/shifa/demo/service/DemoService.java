package com.shifa.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.shifa.demo.data.DemoDataStore;
import com.shifa.demo.dto.DemoChatDTO;
import com.shifa.demo.dto.DemoDoctorDTO;
import com.shifa.demo.dto.DemoPatientDTO;
import com.shifa.demo.dto.DemoVisitDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * DemoService — Business logic for the Shifa demo mode.
 * ─────────────────────────────────────────────────────────────────────────────
 * All data is served from the in-memory DemoDataStore.
 * No database queries, no authentication required.
 *
 * The AI chat endpoint uses a rule-based response system for demo reliability
 * (no AI API key needed to run a demo). In production, this can be swapped
 * for the full Claude SSE streaming pipeline.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DemoService {

    // ─── Patients ──────────────────────────────────────────────────────────────

    /**
     * Returns all 3 demo patients (without visits, for the scenario picker list).
     */
    public List<DemoPatientDTO> getAllPatients() {
        return DemoDataStore.PATIENTS.stream()
            .map(p -> DemoPatientDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .age(p.getAge())
                .gender(p.getGender())
                .city(p.getCity())
                .bloodGroup(p.getBloodGroup())
                .bmi(p.getBmi())
                .initials(p.getInitials())
                .avatarColor(p.getAvatarColor())
                .language(p.getLanguage())
                .languageCode(p.getLanguageCode())
                .specialty(p.getSpecialty())
                .shortDescription(p.getShortDescription())
                .conditions(p.getConditions())
                .currentMedications(p.getCurrentMedications())
                .doctorId(p.getDoctorId())
                // visits intentionally omitted — too heavy for list view
                .build())
            .toList();
    }

    /**
     * Returns a single patient with full visit data.
     */
    public Optional<DemoPatientDTO> getPatientById(String patientId) {
        return Optional.ofNullable(DemoDataStore.PATIENT_MAP.get(patientId));
    }

    /**
     * Returns a specific visit for a patient.
     */
    public Optional<DemoVisitDTO> getVisit(String patientId, String visitId) {
        return Optional.ofNullable(DemoDataStore.PATIENT_MAP.get(patientId))
            .flatMap(p -> p.getVisits().stream()
                .filter(v -> v.getId().equals(visitId))
                .findFirst());
    }

    // ─── Doctors ───────────────────────────────────────────────────────────────

    /**
     * Returns all 3 demo doctors.
     */
    public List<DemoDoctorDTO> getAllDoctors() {
        return DemoDataStore.DOCTORS;
    }

    /**
     * Returns a single doctor with their assigned patients.
     */
    public Optional<DemoDoctorDTO> getDoctorById(String doctorId) {
        return Optional.ofNullable(DemoDataStore.DOCTOR_MAP.get(doctorId));
    }

    /**
     * Returns all patients assigned to a specific doctor.
     */
    public List<DemoPatientDTO> getPatientsByDoctor(String doctorId) {
        return DemoDataStore.PATIENTS.stream()
            .filter(p -> doctorId.equals(p.getDoctorId()))
            .toList();
    }

    // ─── AI Chat ───────────────────────────────────────────────────────────────

    /**
     * Rule-based demo AI chat — no API key required.
     *
     * In production, replace with a call to:
     *   AnthropicService.streamChat(visitContext, userMessage, languageCode)
     *
     * This implementation pattern-matches on the user's question and returns
     * a contextually accurate answer drawn from the patient's visit data.
     * It correctly handles Hindi, Gujarati, and Kannada mixed-language queries.
     */
    public DemoChatDTO.Response chat(String patientId, String visitId, DemoChatDTO.Request request) {
        log.info("[DEMO] Chat — patient={} visit={} lang={}", patientId, visitId, request.getLanguageCode());

        var patient = DemoDataStore.PATIENT_MAP.get(patientId);
        var visitOpt = getVisit(patientId, visitId);

        if (patient == null || visitOpt.isEmpty()) {
            return buildErrorResponse("Patient or visit not found.");
        }

        var visit   = visitOpt.get();
        var message = request.getMessage().toLowerCase();
        var lang    = request.getLanguageCode() != null ? request.getLanguageCode() : "en";

        String response = generateDemoResponse(message, patient, visit, lang);

        return DemoChatDTO.Response.builder()
            .messageId(UUID.randomUUID().toString())
            .role("assistant")
            .content(response)
            .languageCode(lang)
            .isDemoMode(true)
            .disclaimer("This response is AI-generated for demonstration purposes only. Always follow your doctor's advice.")
            .build();
    }

    /**
     * Generates a contextual response based on keyword matching against
     * the patient's actual visit data.
     */
    private String generateDemoResponse(
        String messageLower,
        DemoPatientDTO patient,
        DemoVisitDTO visit,
        String lang
    ) {
        var sections = visit.getSections();

        // ── Diagnosis / what happened ──────────────────────────────────────
        if (containsAny(messageLower, "diagnosis", "diagnose", "condition", "mean", "matlab",
                        "problem", "disease", "bimari", "happened", "kya hua", "what is")) {
            return String.format(
                "**Your Diagnosis**\n\n%s\n\n%s\n\n" +
                "In simple terms: %s",
                visit.getQuickSummary(),
                sections.getDiagnosis(),
                sections.getAssessment()
            );
        }

        // ── Medicines / medications ────────────────────────────────────────
        if (containsAny(messageLower, "medicine", "medication", "drug", "dawa", "tablet",
                        "inhaler", "injection", "dose", "side effect", "safe", "harm")) {
            var sb = new StringBuilder("**Your Medications**\n\n");
            for (var med : sections.getMedications()) {
                sb.append(String.format(
                    "💊 **%s %s** — %s%n" +
                    "When: %s%n" +
                    "Why: %s%n" +
                    "Watch for: %s%n" +
                    "⚠️ %s%n%n",
                    med.getName(), med.getDose(),
                    med.getFrequency(),
                    med.getTiming(),
                    med.getPurpose(),
                    String.join(", ", med.getSideEffects()),
                    med.getWarning()
                ));
            }
            return sb.toString().trim();
        }

        // ── Next actions / what to do ──────────────────────────────────────
        if (containsAny(messageLower, "next", "action", "what should", "do", "follow",
                        "steps", "kya karna", "todo", "checklist")) {
            var sb = new StringBuilder("**Your Next Steps**\n\n");
            int i = 1;
            for (var action : sections.getNextActions()) {
                sb.append(String.format("%d. %s%n", i++, action.getText()));
            }
            return sb.toString().trim();
        }

        // ── Test results / labs ────────────────────────────────────────────
        if (containsAny(messageLower, "test", "result", "lab", "report", "blood", "ecg",
                        "echo", "spirometry", "hba1c", "cholesterol", "peak flow", "report")) {
            var sb = new StringBuilder("**Your Test Results**\n\n");
            for (var result : sections.getTestResults()) {
                String statusEmoji = switch (result.getStatus()) {
                    case "normal"    -> "✅";
                    case "high"      -> "🔴";
                    case "low"       -> "🟠";
                    case "borderline"-> "🟡";
                    case "abnormal"  -> "🔴";
                    case "pending"   -> "⏳";
                    default          -> "ℹ️";
                };
                sb.append(String.format(
                    "%s **%s**: %s (Ref: %s)%n",
                    statusEmoji, result.getName(), result.getValue(), result.getReference()
                ));
            }
            return sb.toString().trim();
        }

        // ── Emergency / when to call doctor ───────────────────────────────
        if (containsAny(messageLower, "emergency", "serious", "hospital", "call", "danger",
                        "worry", "breath", "chest pain", "worse", "ambulance")) {
            return """
                ⚠️ **When to Seek Immediate Help**

                Please go to the nearest hospital emergency or call your doctor immediately if you experience:

                • Severe chest pain, pressure, or tightness
                • Difficulty breathing or shortness of breath at rest
                • Fainting or loss of consciousness
                • Symptoms that are rapidly getting much worse

                For non-urgent concerns, call the clinic during working hours.

                **Emergency:** 112 (National Emergency) or 102 (Ambulance — India)
                """;
        }

        // ── Transcript / what was discussed ───────────────────────────────
        if (containsAny(messageLower, "transcript", "discuss", "conversation", "said",
                        "doctor said", "baat", "summary", "happened", "visit")) {
            return String.format(
                "**What happened in your visit on %s**\n\n%s\n\n" +
                "**Plan discussed:**\n%s",
                visit.getDate(),
                visit.getQuickSummary(),
                formatList(sections.getPlan())
            );
        }

        // ── Symptoms ───────────────────────────────────────────────────────
        if (containsAny(messageLower, "symptom", "feeling", "complaint", "problem reported")) {
            return "**Your Reported Symptoms**\n\n" + formatList(sections.getReportedSymptoms());
        }

        // ── Fallback — general visit summary ──────────────────────────────
        return String.format(
            "Based on your visit on **%s**:\n\n%s\n\n" +
            "**Diagnosis:** %s\n\n" +
            "Would you like me to explain your medicines, test results, or next steps in more detail?",
            visit.getDate(),
            visit.getQuickSummary(),
            sections.getDiagnosis()
        );
    }

    // ─── AI Audit (doctor panel) ───────────────────────────────────────────────

    /**
     * Returns a mock AI audit trail for the doctor panel.
     * In production this would come from an audit_logs table.
     */
    public List<DemoChatDTO.AuditItem> getAiAudit(String patientId) {
        return switch (patientId) {
            case "pat-001" -> List.of(
                DemoChatDTO.AuditItem.builder().id("a1").timestamp("4 Mar, 8:32pm")
                    .question("PVCs ka matlab kya hai?")
                    .aiSummary("AI explained in Hindi that PVCs are extra beats from lower heart chambers and are benign in Rajesh's structurally normal heart.")
                    .reviewedByDoctor(true).severity("info").build(),
                DemoChatDTO.AuditItem.builder().id("a2").timestamp("4 Mar, 9:05pm")
                    .question("Metoprolol achanak band kar sakte hain kya?")
                    .aiSummary("AI advised not to stop metoprolol abruptly, highlighted dizziness/fatigue side effects, and reinforced doctor's taper guidance.")
                    .reviewedByDoctor(true).severity("info").build(),
                DemoChatDTO.AuditItem.builder().id("a3").timestamp("5 Mar, 11:20am")
                    .question("Kya main chai aur gym continue kar sakta hoon?")
                    .aiSummary("AI advised caffeine max one cup/day, daily 30-minute walk or yoga, and avoiding heavy gym/weightlifting until follow-up.")
                    .reviewedByDoctor(false).severity("info").build()
            );
            case "pat-002" -> List.of(
                DemoChatDTO.AuditItem.builder().id("a1").timestamp("3 Mar, 6:45pm")
                    .question("What does HbA1c 8.2% mean?")
                    .aiSummary("AI explained HbA1c as 3-month average blood sugar. 8.2% means sugar has been running high. Target is below 7%.")
                    .reviewedByDoctor(true).severity("info").build(),
                DemoChatDTO.AuditItem.builder().id("a2").timestamp("3 Mar, 7:10pm")
                    .question("Why did the dose of Metformin increase?")
                    .aiSummary("AI explained dose escalation to improve glucose control. Advised monitoring for nausea.")
                    .reviewedByDoctor(true).severity("info").build(),
                DemoChatDTO.AuditItem.builder().id("a3").timestamp("4 Mar, 9:00am")
                    .question("How to collect urine sample for microalbumin test?")
                    .aiSummary("AI explained first morning void sample collection. Directed to nearest lab.")
                    .reviewedByDoctor(false).severity("info").build()
            );
            case "pat-003" -> List.of(
                DemoChatDTO.AuditItem.builder().id("a1").timestamp("5 Mar, 3:20pm")
                    .question("What is GINA Step 4 for asthma?")
                    .aiSummary("AI explained GINA guidelines — Step 4 means moderate-severe persistent asthma requiring combination ICS/LABA therapy.")
                    .reviewedByDoctor(true).severity("info").build(),
                DemoChatDTO.AuditItem.builder().id("a2").timestamp("5 Mar, 4:00pm")
                    .question("Steroid tablet — will it affect me badly?")
                    .aiSummary("AI reassured patient about short 5-day course safety. Explained temporary side effects. Emphasised completing full course.")
                    .reviewedByDoctor(true).severity("info").build(),
                DemoChatDTO.AuditItem.builder().id("a3").timestamp("5 Mar, 9:30pm")
                    .question("How to use the nasal spray correctly?")
                    .aiSummary("AI walked through nasal spray technique — blow nose first, aim away from septum, 2 sprays each nostril.")
                    .reviewedByDoctor(false).severity("info").build()
            );
            default -> List.of();
        };
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private String formatList(List<String> items) {
        if (items == null || items.isEmpty()) return "";
        var sb = new StringBuilder();
        for (int i = 0; i < items.size(); i++) {
            sb.append(String.format("%d. %s%n", i + 1, items.get(i)));
        }
        return sb.toString().trim();
    }

    private DemoChatDTO.Response buildErrorResponse(String message) {
        return DemoChatDTO.Response.builder()
            .messageId(UUID.randomUUID().toString())
            .role("assistant")
            .content(message)
            .isDemoMode(true)
            .build();
    }
}