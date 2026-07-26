package com.shifa.controller;

import com.shifa.common.enums.DocumentType;
import com.shifa.common.enums.OcrStatus;
import com.shifa.common.enums.VisitStatus;
import com.shifa.controller.dto.PatientVisitUploadRequest;
import com.shifa.controller.dto.PatientVisitUploadResponse;
import com.shifa.domain.document.DocumentRepository;
import com.shifa.domain.document.UploadedDocument;
import com.shifa.domain.document.dto.DocumentUploadResponse;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.security.dto.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient/visits")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient Visit Upload")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class PatientVisitController {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final DocumentRepository documentRepository;

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/patient/visits/upload
    // Creates a visit shell (no doctor assigned) for the authenticated patient
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/upload")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    @Operation(summary = "Patient self-uploads a visit (no doctor required)")
    public ResponseEntity<PatientVisitUploadResponse> uploadVisit(
            @Valid @RequestBody PatientVisitUploadRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Patient patient = resolvePatient(currentUser.getUserId());

        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setDoctor(null);                             // patient-uploaded; no doctor yet
        visit.setSource("PATIENT");
        visit.setVisitDate(request.getVisitDate() != null ? request.getVisitDate() : LocalDate.now());
        visit.setVisitType(request.getVisitType() != null ? request.getVisitType() : "General");
        visit.setChiefComplaint(request.getChiefComplaint());
        visit.setRawNotes(buildRawNotes(request));
        visit.setStatus(VisitStatus.DRAFT);
        visit.setCreatedAt(LocalDateTime.now());
        visit.setUpdatedAt(LocalDateTime.now());

        Visit saved = visitRepository.save(visit);
        log.info("[PatientVisitController] Visit created by patient: visitId={} patientId={}",
                saved.getId(), patient.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                PatientVisitUploadResponse.builder()
                        .visitId(saved.getId())
                        .visitDate(saved.getVisitDate())
                        .hospitalName(request.getHospitalName())
                        .doctorName(request.getDoctorName())
                        .chiefComplaint(saved.getChiefComplaint())
                        .visitType(saved.getVisitType())
                        .status(saved.getStatus().name())
                        .documentCount(0)
                        .build()
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/patient/visits/{visitId}/documents
    // Attach a document or audio file to an existing patient visit
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/{visitId}/documents")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    @Operation(summary = "Upload a document or audio file to a patient visit")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @PathVariable UUID visitId,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "OTHER") String documentType,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Patient patient = resolvePatient(currentUser.getUserId());

        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found: " + visitId));

        // Security: the visit must belong to this patient
        if (!visit.getPatient().getId().equals(patient.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        DocumentType dtype;
        try {
            dtype = DocumentType.valueOf(documentType.toUpperCase());
        } catch (IllegalArgumentException e) {
            dtype = DocumentType.OTHER;
        }

        UploadedDocument doc = new UploadedDocument();
        doc.setPatient(patient);
        doc.setVisit(visit);
        doc.setOriginalFilename(file.getOriginalFilename());
        doc.setMimeType(file.getContentType());
        doc.setFileSizeBytes(file.getSize());
        doc.setDocumentType(dtype);
        doc.setS3Bucket("local-dev");
        // placeholder key — real S3 upload will be implemented in a later module
        doc.setS3Key("patient-documents/" + patient.getId() + "/" + visitId + "/"
                + System.currentTimeMillis() + "-" + file.getOriginalFilename());
        doc.setOcrStatus(OcrStatus.PENDING);
        doc.setCreatedAt(LocalDateTime.now());
        doc.setUpdatedAt(LocalDateTime.now());

        UploadedDocument saved = documentRepository.save(doc);

        log.info("[PatientVisitController] Document attached: docId={} visitId={} patientId={}",
                saved.getId(), visitId, patient.getId());

        DocumentUploadResponse response = new DocumentUploadResponse();
        response.setId(saved.getId());
        response.setOriginalFilename(saved.getOriginalFilename());
        response.setDocumentType(saved.getDocumentType().name());
        response.setStatus("UPLOADED");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/patient/visits
    // List all visits belonging to the authenticated patient
    // ──────────────────────────────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional(readOnly = true)
    @Operation(summary = "Get all visits for the logged-in patient")
    public ResponseEntity<List<PatientVisitUploadResponse>> getMyVisits(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Patient patient = resolvePatient(currentUser.getUserId());

        List<Visit> visits = visitRepository.findByPatientIdOrderByVisitDateDesc(patient.getId());

        List<PatientVisitUploadResponse> result = visits.stream()
                .map(v -> {
                    long docCount = documentRepository.countByVisitId(v.getId());
                    String doctorName = null;
                    String hospitalName = null;
                    if (v.getDoctor() != null) {
                        doctorName = "Dr. " + v.getDoctor().getFirstName() + " " + v.getDoctor().getLastName();
                        hospitalName = v.getDoctor().getClinicName();
                    } else {
                        // For patient-uploaded visits, try to extract from rawNotes
                        String[] lines = v.getRawNotes() != null ? v.getRawNotes().split("\n") : new String[0];
                        for (String line : lines) {
                            if (line.startsWith("Doctor: ")) doctorName = line.substring(8).trim();
                            if (line.startsWith("Hospital: ")) hospitalName = line.substring(10).trim();
                        }
                    }
                    return PatientVisitUploadResponse.builder()
                            .visitId(v.getId())
                            .visitDate(v.getVisitDate())
                            .hospitalName(hospitalName)
                            .doctorName(doctorName)
                            .chiefComplaint(v.getChiefComplaint())
                            .visitType(v.getVisitType())
                            .status(v.getStatus().name())
                            .documentCount((int) docCount)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Patient resolvePatient(UUID userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Patient profile not found for user: " + userId));
    }

    /**
     * Encode hospital name and doctor name into rawNotes so we can retrieve them
     * even when no Doctor entity is linked.
     */
    private String buildRawNotes(PatientVisitUploadRequest req) {
        StringBuilder sb = new StringBuilder();
        if (req.getHospitalName() != null && !req.getHospitalName().isBlank()) {
            sb.append("Hospital: ").append(req.getHospitalName()).append("\n");
        }
        if (req.getDoctorName() != null && !req.getDoctorName().isBlank()) {
            sb.append("Doctor: ").append(req.getDoctorName()).append("\n");
        }
        if (req.getNotes() != null && !req.getNotes().isBlank()) {
            sb.append(req.getNotes());
        }
        return sb.toString().trim();
    }
}
