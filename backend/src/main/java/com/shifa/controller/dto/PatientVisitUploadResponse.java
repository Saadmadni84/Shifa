package com.shifa.controller.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class PatientVisitUploadResponse {
    private UUID visitId;
    private LocalDate visitDate;
    private String hospitalName;
    private String doctorName;
    private String chiefComplaint;
    private String visitType;
    private String status;
    private int documentCount;
}
