package com.shifa.integration.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.common.enums.Language;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitSummaryData;
import com.shifa.integration.ai.dto.ClaudeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIPromptService {

    private final ClaudeClient claudeClient;
    private final AIResponseParser responseParser;
    private final AIUsageTracker usageTracker;
    private final ObjectMapper objectMapper;

    // 1. Visit Summary
    public VisitSummaryData generateVisitSummary(Visit visit, Patient patient) {
        log.info("[AI] generateVisitSummary. visitId={}", visit.getId());
        if (visit.getDoctor() != null) {
            usageTracker.checkAndRecord(visit.getDoctor().getId(), "VISIT_SUMMARY");
        }

        String raw = claudeClient.sendMessage(
            buildMedicalExtractionSystemPrompt(),
            buildVisitExtractionPrompt(visit, patient)
        );

        return responseParser.parseVisitSummary(raw);
    }

    // 2. Patient-Friendly Text
    public String generatePatientFriendlyText(VisitSummaryData summary,
                                               Patient patient,
                                               Language lang) {
        log.info("[AI] generatePatientFriendlyText. patientId={}, lang={}",
            patient.getId(), lang);

        return claudeClient.sendMessage(
            buildPatientTextSystemPrompt(lang),
            buildPatientTextPrompt(summary, patient, lang)
        );
    }

    // 3. Patient Q&A Chat
    public String answerPatientQuestion(Visit visit,
                                        List<ClaudeRequest.Message> history,
                                        String question,
                                        Language lang) {
        List<ClaudeRequest.Message> messages = new ArrayList<>(history);
        messages.add(ClaudeRequest.Message.builder().role("user").content(question).build());
        return claudeClient.sendConversation(buildChatSystemPrompt(visit, lang), messages);
    }

    public Flux<String> streamPatientAnswer(Visit visit,
                                            List<ClaudeRequest.Message> history,
                                            String question,
                                            Language lang) {
        List<ClaudeRequest.Message> messages = new ArrayList<>(history);
        messages.add(ClaudeRequest.Message.builder().role("user").content(question).build());
        return claudeClient.streamConversation(buildChatSystemPrompt(visit, lang), messages);
    }

    // 4. Translation Fallback
    public String translateWithClaude(String english, Language target) {
        String prompt = """
            Translate the following medical patient summary from English to %s.
            Rules:
            1. Translate EVERY word — keep medicine brand names in original.
            2. Simple, respectful language for uneducated patients.
            3. Keep numbers, measurements, emojis unchanged.
            4. Return ONLY the translated text.

            TEXT:
            %s
            """.formatted(target.getDisplayName(), english);

        return claudeClient.sendMessage(
            "You are a professional medical translator for Indian languages.", prompt);
    }

    // 5. Drug Interaction Check
    public String checkDrugInteractions(List<String> meds, List<String> allergies) {
        String prompt = """
            Check drug-allergy conflicts and major interactions.
            MEDICATIONS: %s
            ALLERGIES: %s
            Return JSON: {"hasConflicts":bool,"conflicts":[{"drug":"","issue":"","severity":"HIGH|MEDIUM|LOW"}],"safetyNote":""}
            """.formatted(String.join(", ", meds),
                          allergies.isEmpty() ? "None" : String.join(", ", allergies));

        return claudeClient.sendMessage(
            "You are a clinical pharmacist. Only flag confirmed interactions.", prompt);
    }

    // Private Prompt Builders

    private String buildMedicalExtractionSystemPrompt() {
        return """
            You are an expert Indian medical AI for extracting structured data from clinical notes.

            Expertise:
            - Indian generic drugs: Crocin, Dolo 650, Pan-D, Metformin, Amlodipine, Azithromycin
            - Abbreviations: BD=twice daily, TDS=thrice daily, OD=once daily, SOS=as needed
            - Indian diseases: Dengue, Typhoid, Malaria, T2DM, Hypertension, TB, PCOD
            - Indian diet: khichdi, curd-rice, ORS, coconut water, dal

            Rules:
            - Extract ONLY what is in notes. Never add medications.
            - Flag critical meds (BP, diabetes, heart, thyroid, blood thinners).
            - Mark refrigeration-needed meds (insulin, eye drops).
            - Return VALID JSON ONLY. No markdown fences.
            """;
    }

    private String buildVisitExtractionPrompt(Visit visit, Patient patient) {
        return """
            Extract a structured medical summary.

            PATIENT: %s %s, Age %d, %s
            ALLERGIES: %s
            CONDITIONS: %s
            DATE: %s | COMPLAINT: %s

            NOTES:
            %s

            JSON FORMAT:
            {
              "diagnosis":"","diagnosisDetails":"","icd10Code":"",
              "medications":[{"name":"","genericName":"","dosage":"","frequency":"",
                "timing":"","durationDays":0,"route":"ORAL","purpose":"",
                "sideEffectsToWatch":[],"needsRefrigeration":false,"critical":false}],
              "dietaryAdvice":[],"activityRestrictions":[],
              "followUpInDays":0,"redFlags":[],"testsOrdered":[],
              "doctorInstructions":"","confidenceScore":0.9
            }
            """.formatted(
                patient.getFirstName(), patient.getLastName(), patient.getAge(),
                patient.getGender() != null ? patient.getGender() : "Not specified",
                patient.getAllergies().isEmpty() ? "None" : String.join(", ", patient.getAllergies()),
                patient.getChronicConditions().isEmpty() ? "None" : String.join(", ", patient.getChronicConditions()),
                visit.getVisitDate(), visit.getChiefComplaint(), visit.getRawNotes()
            );
    }

    private String buildPatientTextSystemPrompt(Language lang) {
        return """
            You are Shifa, a compassionate Indian medical companion writing in %s.
            Use simple, warm language. Avoid jargon. Use Indian food examples (khichdi, dal, ORS).
            Under 600 words. Always end with encouragement.
            """.formatted(lang.getDisplayName());
    }

    private String buildPatientTextPrompt(VisitSummaryData summary,
                                           Patient patient, Language lang) {
        try {
            return """
                Convert this summary into a warm WhatsApp message in %s.
                Patient: %s, Age %d.
                Summary JSON: %s
                Structure: Greeting → Diagnosis → Medicines → Diet → Follow-up → Red flags → Encouragement
                """.formatted(lang.getDisplayName(), patient.getFirstName(),
                               patient.getAge(), objectMapper.writeValueAsString(summary));
        } catch (Exception e) { return summary.getDiagnosis(); }
    }

    private String buildChatSystemPrompt(Visit visit, Language lang) {
        String summaryJson;
        try {
            summaryJson = visit.getAiSummary() != null
                ? objectMapper.writeValueAsString(visit.getAiSummary()) : "{}";
        } catch (Exception e) { summaryJson = "{}"; }

        return """
            You are Shifa helping patient %s %s understand their visit from %s.
            ALWAYS respond in %s. If emergency symptoms, say: call 112 immediately.
            Answer ONLY from visit context. Never change medications.
            VISIT CONTEXT: %s
            """.formatted(
                visit.getPatient().getFirstName(), visit.getPatient().getLastName(),
                visit.getVisitDate(), lang.getDisplayName(), summaryJson
            );
    }
}
