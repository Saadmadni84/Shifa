package com.shifa.demo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * DemoDoctorDTO — Complete doctor profile for demo mode.
 *
 * Returned by GET /api/v1/demo/doctors
 * and GET /api/v1/demo/doctors/{doctorId}
 */
@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DemoDoctorDTO {

    // ── Identity ──────────────────────────────────────────────────────────
    String id;
    String name;
    String specialty;
    String qualifications;
    String hospital;
    String phone;
    String email;
    String initials;
    String color;           // Hex color for avatar

    // ── Stats (demo numbers) ──────────────────────────────────────────────
    DoctorStats stats;

    // ── Assigned patients ─────────────────────────────────────────────────
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    List<String> patientIds;

    @Value
    @Builder
    public static class DoctorStats {
        int totalPatients;
        int visitsThisWeek;
        int pendingReports;
        int newMessages;
    }
}