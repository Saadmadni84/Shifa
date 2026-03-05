package com.shifa.domain.visit.dto;

import lombok.Data;

@Data
public class VisitRequest {
    private Long patientId;
    private Long doctorId;
    private String notes;
}
