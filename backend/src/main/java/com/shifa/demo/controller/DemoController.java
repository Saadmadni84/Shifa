package com.shifa.demo.controller;

import com.shifa.demo.dto.DemoChatDTO;
import com.shifa.demo.dto.DemoDoctorDTO;
import com.shifa.demo.dto.DemoPatientDTO;
import com.shifa.demo.dto.DemoVisitDTO;
import com.shifa.demo.service.DemoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * DemoController — Public demo endpoints for Shifa.
 * ─────────────────────────────────────────────────────────────────────────────
 * Base path : /api/v1/demo
 * Auth       : NONE — all endpoints are public (no JWT required)
 * Purpose    : Power the frontend demo mode with 3 patients + 3 doctors.
 *
 * All endpoints are permitted via SecurityConfig:
 *   .requestMatchers("/api/v1/demo/**").permitAll()
 *
 * Endpoints:
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PATIENT endpoints                                                        │
 * │  GET  /api/v1/demo/patients                   → all 3 patients (list)   │
 * │  GET  /api/v1/demo/patients/{id}              → single patient + visits  │
 * │  GET  /api/v1/demo/patients/{id}/visits/{vid} → single visit detail      │
 * │  POST /api/v1/demo/patients/{id}/visits/{vid}/chat → AI chat             │
 * │                                                                          │
 * │ DOCTOR endpoints                                                         │
 * │  GET  /api/v1/demo/doctors                    → all 3 doctors            │
 * │  GET  /api/v1/demo/doctors/{id}               → single doctor            │
 * │  GET  /api/v1/demo/doctors/{id}/patients      → doctor's patients        │
 * │  GET  /api/v1/demo/doctors/{id}/patients/{pid}/audit → AI audit trail   │
 * └──────────────────────────────────────────────────────────────────────────┘
 * ─────────────────────────────────────────────────────────────────────────────
 */
@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Demo", description = "Public demo endpoints — no authentication required")
public class DemoController {

    private final DemoService demoService;

    // ═══════════════════════════════════════════════════════════════════════════
    // PATIENT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/demo/patients
     *
     * Returns all 3 demo patients without visit data (for scenario picker card grid).
     * Cached for 5 minutes — data is static.
     */
    @GetMapping("/patients")
    @Operation(
        summary = "List all demo patients",
        description = "Returns 3 fictional Indian patients for the demo scenario picker. No auth required."
    )
    public ResponseEntity<List<DemoPatientDTO>> listPatients() {
        log.debug("[DEMO] GET /patients");
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
            .body(demoService.getAllPatients());
    }

    /**
     * GET /api/v1/demo/patients/{patientId}
     *
     * Returns a full patient profile including all visit data, SOAP sections,
     * test results, medications, and transcript.
     */
    @GetMapping("/patients/{patientId}")
    @Operation(
        summary = "Get a demo patient by ID",
        description = "Returns the full patient record including all visits. IDs: pat-001, pat-002, pat-003."
    )
    public ResponseEntity<DemoPatientDTO> getPatient(
        @Parameter(description = "Patient ID (pat-001, pat-002, pat-003)")
        @PathVariable String patientId
    ) {
        log.debug("[DEMO] GET /patients/{}", patientId);
        return demoService.getPatientById(patientId)
            .map(p -> ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(p))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/demo/patients/{patientId}/visits/{visitId}
     *
     * Returns a single visit with full SOAP structure, test results,
     * medications, action items, and transcript.
     */
    @GetMapping("/patients/{patientId}/visits/{visitId}")
    @Operation(
        summary = "Get a specific demo visit",
        description = "Returns a single visit record. Visit IDs: visit-001-a, visit-002-a, visit-003-a."
    )
    public ResponseEntity<DemoVisitDTO> getVisit(
        @PathVariable String patientId,
        @PathVariable String visitId
    ) {
        log.debug("[DEMO] GET /patients/{}/visits/{}", patientId, visitId);
        return demoService.getVisit(patientId, visitId)
            .map(v -> ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(v))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/v1/demo/patients/{patientId}/visits/{visitId}/chat
     *
     * Demo AI chat endpoint. Accepts a user question and returns a contextual
     * answer based on the patient's actual visit data.
     *
     * Request body:
     *   { "message": "What does my diagnosis mean?", "languageCode": "hi" }
     *
     * Response:
     *   { "messageId": "...", "role": "assistant", "content": "...", ... }
     *
     * Note: This demo endpoint uses a rule-based response engine (no API key
     * required). In production, swap DemoService.chat() for the full Claude
     * SSE streaming pipeline.
     *
     * Rate limiting: 60 requests/minute per IP (configured in SecurityConfig).
     */
    @PostMapping("/patients/{patientId}/visits/{visitId}/chat")
    @Operation(
        summary = "Demo AI chat",
        description = "Ask a question about the demo visit. Returns a contextual AI answer without requiring an API key. Supports mixed Hindi/Gujarati/Kannada questions."
    )
    public ResponseEntity<DemoChatDTO.Response> chat(
        @PathVariable String patientId,
        @PathVariable String visitId,
        @Valid @RequestBody DemoChatDTO.Request request
    ) {
        log.info("[DEMO] CHAT /patients/{}/visits/{} — \"{}\"",
            patientId, visitId, truncate(request.getMessage(), 80));

        var response = demoService.chat(patientId, visitId, request);
        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DOCTOR ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/demo/doctors
     *
     * Returns all 3 demo doctors with stats (for the doctor picker page).
     */
    @GetMapping("/doctors")
    @Operation(
        summary = "List all demo doctors",
        description = "Returns 3 fictional Indian doctors. No auth required."
    )
    public ResponseEntity<List<DemoDoctorDTO>> listDoctors() {
        log.debug("[DEMO] GET /doctors");
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
            .body(demoService.getAllDoctors());
    }

    /**
     * GET /api/v1/demo/doctors/{doctorId}
     *
     * Returns a single doctor's profile and stats.
     */
    @GetMapping("/doctors/{doctorId}")
    @Operation(
        summary = "Get a demo doctor by ID",
        description = "IDs: doc-001 (Cardiologist), doc-002 (Endocrinologist), doc-003 (Pulmonologist)."
    )
    public ResponseEntity<DemoDoctorDTO> getDoctor(
        @Parameter(description = "Doctor ID (doc-001, doc-002, doc-003)")
        @PathVariable String doctorId
    ) {
        log.debug("[DEMO] GET /doctors/{}", doctorId);
        return demoService.getDoctorById(doctorId)
            .map(d -> ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(d))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/demo/doctors/{doctorId}/patients
     *
     * Returns all patients assigned to this doctor (for the doctor's patient list).
     */
    @GetMapping("/doctors/{doctorId}/patients")
    @Operation(
        summary = "Get patients assigned to a demo doctor",
        description = "Returns all demo patients for this doctor's panel."
    )
    public ResponseEntity<List<DemoPatientDTO>> getDoctorPatients(
        @PathVariable String doctorId
    ) {
        log.debug("[DEMO] GET /doctors/{}/patients", doctorId);
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
            .body(demoService.getPatientsByDoctor(doctorId));
    }

    /**
     * GET /api/v1/demo/doctors/{doctorId}/patients/{patientId}/audit
     *
     * Returns the AI transparency audit trail for a patient.
     * Used in the doctor panel "AI Audit" tab.
     */
    @GetMapping("/doctors/{doctorId}/patients/{patientId}/audit")
    @Operation(
        summary = "Get AI audit trail for a patient",
        description = "Returns a log of all AI explanations given to the patient, for doctor review."
    )
    public ResponseEntity<List<DemoChatDTO.AuditItem>> getAiAudit(
        @PathVariable String doctorId,
        @PathVariable String patientId
    ) {
        log.debug("[DEMO] GET /doctors/{}/patients/{}/audit", doctorId, patientId);
        return ResponseEntity.ok(demoService.getAiAudit(patientId));
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private String truncate(String s, int maxLen) {
        if (s == null) return "";
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "…";
    }
}