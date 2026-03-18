package com.shifa.dto;

import java.util.List;

public class InteractionSummaryDTO {

    private String overallSeverity;
    private String recommendation;
    private List<InteractionResultDTO> interactions;

    public String getOverallSeverity() {
        return overallSeverity;
    }

    public void setOverallSeverity(String overallSeverity) {
        this.overallSeverity = overallSeverity;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public List<InteractionResultDTO> getInteractions() {
        return interactions;
    }

    public void setInteractions(List<InteractionResultDTO> interactions) {
        this.interactions = interactions;
    }
}
