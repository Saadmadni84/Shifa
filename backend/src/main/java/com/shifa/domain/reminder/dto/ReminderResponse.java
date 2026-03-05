package com.shifa.domain.reminder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReminderResponse {

    String id;
    String patientId;
    String visitId;
    String prescriptionId;

    String medicationName;
    String dosage;
    String instructions;

    LocalTime scheduleTime;
    String frequency;
    LocalDate endDate;

    boolean active;
    LocalDateTime lastSentAt;
    LocalDateTime nextRunTime;

    LocalDateTime createdAt;
}
