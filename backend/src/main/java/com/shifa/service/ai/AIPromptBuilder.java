package com.shifa.service.ai;

import com.shifa.service.dto.VisitSummaryData;
import com.shifa.domain.visit.Visit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class AIPromptBuilder {

    private final ResourceLoader resourceLoader;

    @Value("${claude.model:claude-3-5-sonnet-20241022}")
    private String model;

    private static final java.util.Map<String, String> LANGUAGE_NAMES = java.util.Map.ofEntries(
            java.util.Map.entry("hi", "Hindi (हिन्दी)"),
            java.util.Map.entry("ta", "Tamil (தமிழ்)"),
            java.util.Map.entry("te", "Telugu (తెలుగు)"),
            java.util.Map.entry("bn", "Bengali (বাংলা)"),
            java.util.Map.entry("mr", "Marathi (मराठी)"),
            java.util.Map.entry("gu", "Gujarati (ગુજરાતી)"),
            java.util.Map.entry("kn", "Kannada (ಕನ್ನಡ)"),
            java.util.Map.entry("ml", "Malayalam (മലയാളം)"),
            java.util.Map.entry("pa", "Punjabi (ਪੰਜਾਬੀ)"),
            java.util.Map.entry("ur", "Urdu (اردو)"),
            java.util.Map.entry("en", "English"));

    public AIPromptBuilder(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public String buildVisitSummarySystemPrompt() {
        return loadResourceFile("classpath:prompts/visit_summary_system_en.txt");
    }

    public String buildVisitSummaryUserPrompt(Visit visit) {
        return """
                DOCTOR'S NOTES:
                %s

                PATIENT CONTEXT:
                - Name: %s
                - Age: %s
                - Preferred Language: %s
                - Known Conditions: %s
                - Current Medicines: %s

                Please generate the structured JSON summary now.
                """.formatted(
                visit.getRawNotes(),
                visit.getPatient().getFullName(),
                visit.getPatient().getAge() != null ? visit.getPatient().getAge() + " years" : "Not specified",
                LANGUAGE_NAMES.getOrDefault(visit.getPatient().getPreferredLanguage().getCode(), "Hindi"),
                visit.getPatient().getKnownConditionsText(),
                visit.getPatient().getCurrentMedicinesText());
    }

    public String buildPatientTextSystemPrompt(String languageCode) {
        String langName = LANGUAGE_NAMES.getOrDefault(languageCode, "Hindi");
        String template = loadResourceFile("classpath:prompts/patient_text_system.txt");
        return template.replace("{langName}", langName);
    }

    public String buildPatientTextUserPrompt(VisitSummaryData summary, String languageCode) {
        return """
                Convert this medical summary into a warm patient message in %s:

                DIAGNOSIS: %s
                DETAILS: %s
                MEDICINES: %s
                DIET ADVICE: %s
                ACTIVITY RESTRICTIONS: %s
                RED FLAGS (GO TO HOSPITAL IF): %s
                FOLLOW-UP: %s
                DOCTOR'S SPECIAL INSTRUCTIONS: %s
                """.formatted(
                LANGUAGE_NAMES.getOrDefault(languageCode, "Hindi"),
                summary.getDiagnosis(),
                summary.getDiagnosisDetails(),
                formatMedications(summary),
                String.join("; ", summary.getDietaryAdvice()),
                String.join("; ", summary.getActivityRestrictions()),
                String.join("; ", summary.getRedFlags()),
                summary.getFollowUpInstructions() != null ? summary.getFollowUpInstructions()
                        : (summary.getFollowUpInDays() != null ? summary.getFollowUpInDays() + " days" : "None"),
                summary.getDoctorInstructions() != null ? summary.getDoctorInstructions() : "None");
    }

    public String buildPatientChatSystemPrompt(Visit visit, String languageCode) {
        String langName = LANGUAGE_NAMES.getOrDefault(languageCode, "Hindi");
        String summaryContext = visit.getAiSummaryJson() != null ? visit.getAiSummaryJson() : "No summary available";

        String template = loadResourceFile("classpath:prompts/patient_chat_system.txt");
        return template.replace("{summaryContext}", summaryContext).replace("{langName}", langName);
    }

    public String buildTranslationSystemPrompt(String targetLanguageCode) {
        String langName = LANGUAGE_NAMES.getOrDefault(targetLanguageCode, "Hindi");
        String template = loadResourceFile("classpath:prompts/translation_system.txt");
        return template.replace("{langName}", langName);
    }

    private String formatMedications(VisitSummaryData summary) {
        if (summary.getMedications() == null || summary.getMedications().isEmpty()) {
            return "None";
        }
        StringBuilder sb = new StringBuilder();
        for (VisitSummaryData.MedicationSummary med : summary.getMedications()) {
            sb.append(String.format("\n- %s %s: %s, %s",
                    med.getName(),
                    med.getDosage() != null ? med.getDosage() : "",
                    med.getFrequency() != null ? med.getFrequency() : "",
                    med.getTiming() != null ? med.getTiming() : ""));
        }
        return sb.toString();
    }

    private String loadResourceFile(String path) {
        try {
            return new String(resourceLoader.getResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load prompt from path: {}", path, e);
            throw new RuntimeException("Could not load prompt: " + path, e);
        }
    }
}
