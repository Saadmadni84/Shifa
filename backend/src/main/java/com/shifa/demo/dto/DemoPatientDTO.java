package com.shifa.demo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * DemoPatientDTO — Complete patient profile for demo mode.
 *
 * Returned by GET /api/v1/demo/patients
 * and GET /api/v1/demo/patients/{patientId}
 *
 * All data is entirely fictional — created for demonstration only.
 */
@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DemoPatientDTO {

    // ── Identity ──────────────────────────────────────────────────────────
    String id;
    String name;
    int    age;
    String gender;
    String dateOfBirth;
    String city;
    String phone;
    String email;
    String bloodGroup;
    double bmi;
    String initials;
    String avatarColor;

    // ── Language ──────────────────────────────────────────────────────────
    String language;
    String languageCode;   // "hi" | "gu" | "kn" | "ta" | "te" | "mr" | "en"

    // ── Clinical context ──────────────────────────────────────────────────
    String specialty;
    String shortDescription;
    List<String> conditions;
    List<String> currentMedications;

    // ── Relationships ──────────────────────────────────────────────────────
    String doctorId;

    // ── Visits (populated in detail endpoint) ─────────────────────────────
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    List<DemoVisitDTO> visits;
}