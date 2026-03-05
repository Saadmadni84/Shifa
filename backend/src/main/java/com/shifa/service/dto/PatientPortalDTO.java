package com.shifa.service.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class PatientPortalDTO {

    UUID visitId;
    String visitDate;

    String doctorName;
    String doctorSpecialization;
    String clinicName;
    String clinicPhone;

    String patientFirstName;
    String preferredLanguage;

    VisitSummaryData aiSummary;
    String patientFriendlyText;

    LocalDate followUpDate;
    LocalDateTime tokenExpiresAt;

    String whatsappStatus;
}
