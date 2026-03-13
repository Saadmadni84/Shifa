// DoctorController
// backend/src/main/java/com/shifa/controller/DoctorController.java
package com.shifa.controller;

import com.shifa.dto.DashboardResponseDto;
import com.shifa.dto.PatientSummaryDto;
import com.shifa.dto.VisitSummaryDto;
import com.shifa.dto.VisitDetailDto;
import com.shifa.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DoctorController
 * Base path: /api/v1/doctor
 *
 * All endpoints require ROLE_DOCTOR.
 * Demo mode: when X-Demo-Mode: true header is present, data comes from DemoDataService.
 */
@RestController
@RequestMapping("/api/v1/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;

    // ── GET /api/v1/doctor/dashboard ────────────────────────────────────────
    /**
     * Returns overview for the doctor dashboard:
     * - Doctor profile
     * - Stats (total patients, unread messages, total visits, alert patients)
     * - Alert patients (high-priority)
     * - Recent patients (last 4 by visit date)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Demo-Mode", defaultValue = "false") boolean demoMode,
            @RequestAttribute(required = false) String doctorId
    ) {
        DashboardResponseDto dashboard = doctorService.getDashboard(doctorId, demoMode);
        return ResponseEntity.ok(Map.of("data", dashboard));
    }

    // ── GET /api/v1/doctor/patients ─────────────────────────────────────────
    /**
     * Returns paginated, searchable patient list for this doctor.
     * Query params:
     *   q       — name/condition search string
     *   status  — alert | review | stable (filter)
     *   page    — page number (0-based)
     *   size    — page size (default 20)
     */
    @GetMapping("/patients")
    public ResponseEntity<Map<String, Object>> getPatients(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Demo-Mode", defaultValue = "false") boolean demoMode,
            @RequestAttribute(required = false) String doctorId
    ) {
        List<PatientSummaryDto> patients = doctorService.getPatients(doctorId, q, status, page, size, demoMode);
        return ResponseEntity.ok(Map.of("data", patients));
    }

    // ── GET /api/v1/doctor/patients/{patientId} ─────────────────────────────
    /**
     * Returns full patient detail:
     * - Demographics + vitals
     * - Active conditions
     * - Active medications
     * Used by PatientProfilePage.
     */
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<Map<String, Object>> getPatientDetail(
            @PathVariable String patientId,
            @RequestHeader(value = "X-Demo-Mode", defaultValue = "false") boolean demoMode
    ) {
        PatientSummaryDto patient = doctorService.getPatientDetail(patientId, demoMode);
        return ResponseEntity.ok(Map.of("data", patient));
    }

    // ── GET /api/v1/doctor/patients/{patientId}/visits ──────────────────────
    /**
     * Returns all visits for a patient, newest first.
     * Each visit includes: date, type, diagnosis, instructions, whatsapp delivery status.
     */
    @GetMapping("/patients/{patientId}/visits")
    public ResponseEntity<Map<String, Object>> getPatientVisits(
            @PathVariable String patientId,
            @RequestHeader(value = "X-Demo-Mode", defaultValue = "false") boolean demoMode
    ) {
        List<VisitSummaryDto> visits = doctorService.getPatientVisits(patientId, demoMode);
        return ResponseEntity.ok(Map.of("data", visits));
    }

    // ── GET /api/v1/doctor/patients/{patientId}/visits/{visitId} ───────────
    /**
     * Returns full visit detail:
     * - Clinical notes, vitals, prescriptions, instructions
     * - WhatsApp summary preview + delivery status
     */
    @GetMapping("/patients/{patientId}/visits/{visitId}")
    public ResponseEntity<Map<String, Object>> getVisitDetail(
            @PathVariable String patientId,
            @PathVariable String visitId,
            @RequestHeader(value = "X-Demo-Mode", defaultValue = "false") boolean demoMode
    ) {
        VisitDetailDto visit = doctorService.getVisitDetail(patientId, visitId, demoMode);
        return ResponseEntity.ok(Map.of("data", visit));
    }

    // ── GET /api/v1/doctor/visits ───────────────────────────────────────────
    /**
     * All visits for this doctor across all patients (sorted by date desc).
     * Used by the VisitsPage.
     */
    @GetMapping("/visits")
    public ResponseEntity<Map<String, Object>> getAllVisits(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestHeader(value = "X-Demo-Mode", defaultValue = "false") boolean demoMode,
            @RequestAttribute(required = false) String doctorId
    ) {
        List<VisitDetailDto> visits = doctorService.getAllVisits(doctorId, q, page, size, demoMode);
        return ResponseEntity.ok(Map.of("data", visits));
    }
}

