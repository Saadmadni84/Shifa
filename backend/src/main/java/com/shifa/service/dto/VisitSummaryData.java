package com.shifa.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class VisitSummaryData {

    private String diagnosis;
    private String diagnosisDetails;
    private String chiefComplaint;

    @Builder.Default
    private List<MedicationSummary> medications = new ArrayList<>();

    @Builder.Default
    private List<String> dietaryAdvice = new ArrayList<>();

    @Builder.Default
    private List<String> activityRestrictions = new ArrayList<>();

    @Builder.Default
    private List<String> redFlags = new ArrayList<>();

    @Builder.Default
    private List<String> testsOrdered = new ArrayList<>();

    @Builder.Default
    private List<String> nextActions = new ArrayList<>();

    private Integer followUpInDays;
    private String followUpInstructions;
    private String doctorInstructions;
    private Double confidenceScore;

    private String patientFriendlyText;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MedicationSummary {
        private String name;
        private String genericName;
        private String brandNote;
        private String dosage;
        private String frequency;
        private String timing;
        private Integer durationDays;
        private String purpose;
        private boolean critical;

        @Builder.Default
        private List<String> sideEffectsToWatch = new ArrayList<>();
    }
}
