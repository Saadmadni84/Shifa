package com.shifa.domain.visit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VisitListResponse {

    String id;
    LocalDate visitDate;
    String visitType;
    String status;

    String patientId;
    String patientName;
    String patientPhone;
    int patientAge;

    String chiefComplaint;
    String diagnosis;

    String aiStatus;
    String whatsappStatus;
    boolean summaryRead;

    boolean portalAccessValid;

    LocalDateTime createdAt;
}
