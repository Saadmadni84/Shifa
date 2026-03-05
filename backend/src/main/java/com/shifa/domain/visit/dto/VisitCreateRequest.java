package com.shifa.domain.visit.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
public class VisitCreateRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Visit date is required")
    @PastOrPresent(message = "Visit date cannot be in the future")
    private LocalDate visitDate;

    @Pattern(regexp = "IN_PERSON|TELEMEDICINE|HOME_VISIT",
             message = "Visit type must be IN_PERSON, TELEMEDICINE, or HOME_VISIT")
    private String visitType = "IN_PERSON";

    @Size(max = 1000, message = "Chief complaint must not exceed 1000 characters")
    private String chiefComplaint;

    @Size(max = 50000)
    private String rawNotes;

    @Future(message = "Follow-up date must be in the future")
    private LocalDate followUpDate;

    private UUID prescriptionDocumentId;
}
