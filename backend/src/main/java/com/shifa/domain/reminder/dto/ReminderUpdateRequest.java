package com.shifa.domain.reminder.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class ReminderUpdateRequest {

    @Size(max = 200)
    private String medicationName;

    @Size(max = 200)
    private String dosage;

    @Size(max = 1000)
    private String instructions;

    private LocalTime scheduleTime;

    @Pattern(regexp = "DAILY|WEEKLY|MONTHLY|ONCE")
    private String frequency;

    @Future
    private LocalDate endDate;

    private Boolean active;
}
