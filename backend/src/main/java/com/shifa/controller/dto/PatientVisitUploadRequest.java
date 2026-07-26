package com.shifa.controller.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class PatientVisitUploadRequest {

    @NotNull(message = "Visit date is required")
    @PastOrPresent(message = "Visit date cannot be in the future")
    private LocalDate visitDate;

    /** Free-text hospital / clinic name entered by patient */
    @Size(max = 300)
    private String hospitalName;

    /** Doctor name as entered by patient (not a DB foreign-key) */
    @Size(max = 200)
    private String doctorName;

    /** Reason / chief complaint for the visit */
    @Size(max = 2000)
    private String chiefComplaint;

    /** Any additional notes the patient wants to record */
    @Size(max = 10000)
    private String notes;

    /**
     * Patient-supplied visit type label.
     * E.g. "General", "Follow-up", "Emergency", "Specialist", "Lab"
     */
    @Size(max = 50)
    private String visitType;
}
