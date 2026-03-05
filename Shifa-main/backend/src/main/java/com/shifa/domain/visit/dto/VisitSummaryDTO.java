package com.shifa.domain.visit.dto;

import lombok.Data;

@Data
public class VisitSummaryDTO {
    private String diagnosis;
    private String medicines;
    private String schedule;
    private String diet;
    private String redFlags;
}
