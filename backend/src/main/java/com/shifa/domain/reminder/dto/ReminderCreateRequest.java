package com.shifa.domain.reminder.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class ReminderCreateRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private UUID visitId;
    private UUID prescriptionId;

    @NotBlank(message = "Medication name is required")
    @Size(max = 200)
    private String medicationName;

    @Size(max = 200)
    private String dosage;

    @Size(max = 1000)
    private String instructions;

    @NotNull(message = "Schedule time is required")
    private LocalTime scheduleTime;

    @Pattern(regexp = "DAILY|WEEKLY|MONTHLY|ONCE", message = "Invalid frequency")
    private String frequency = "DAILY";

    @Future(message = "End date must be in the future")
    private LocalDate endDate;
}
