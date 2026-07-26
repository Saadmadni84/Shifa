package com.shifa.domain.visit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class VisitSummaryData implements Serializable {

    private String diagnosis;
    private String diagnosisDetails;
    private String icd10Code;

    @Builder.Default
    private List<MedicationSummary> medications = new ArrayList<>();

    @Builder.Default
    private List<String> dietaryAdvice = new ArrayList<>();
    @Builder.Default
    private List<String> activityRestrictions = new ArrayList<>();

    private Integer followUpInDays;

    @Builder.Default
    private List<String> redFlags = new ArrayList<>();

    @Builder.Default
    private List<String> testsOrdered = new ArrayList<>();

    private String doctorInstructions;

    private Double confidenceScore;
    private String aiModel;
    private LocalDateTime generatedAt;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MedicationSummary implements Serializable {
        private String name;
        private String genericName;
        private String dosage;
        private String frequency;
        private String timing;
        private Integer durationDays;
        private String purpose;
        @Builder.Default
        private List<String> sideEffectsToWatch = new ArrayList<>();
        private boolean needsRefrigeration;
        private boolean critical;
    }
}
