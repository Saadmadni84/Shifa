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
import com.shifa.domain.user.UserRepository;
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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/patient/visits/upload
    // Creates a visit shell (no doctor assigned) for the authenticated patient
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/upload")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    @Operation(summary = "Patient self-uploads a visit (no doctor required)")
    public ResponseEntity<?> uploadVisit(
            @Valid @RequestBody PatientVisitUploadRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
                currentUser = (UserPrincipal) auth.getPrincipal();
            }
        }
        if (currentUser == null || currentUser.getUserId() == null) {
            log.error("Unauthorized uploadVisit access: missing authenticated UserPrincipal/userId");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized",
                    "message", "User is not authenticated"
            ));
        }

        log.info("[PatientVisitController] uploadVisit start: userId={}", currentUser.getUserId());
        try {
            log.info("[PatientVisitController] uploadVisit payload: visitDate={} visitType={} chiefComplaintPresent={} hospitalNamePresent={} doctorNamePresent={} notesPresent={}",
                    request != null ? request.getVisitDate() : null,
                    request != null ? request.getVisitType() : null,
                    request != null && request.getChiefComplaint() != null && !request.getChiefComplaint().isBlank(),
                    request != null && request.getHospitalName() != null && !request.getHospitalName().isBlank(),
                    request != null && request.getDoctorName() != null && !request.getDoctorName().isBlank(),
                    request != null && request.getNotes() != null && !request.getNotes().isBlank());

            Patient patient = patientRepository.findByUserId(currentUser.getUserId()).orElse(null);
            if (patient == null) {
                var user = userRepository.findById(currentUser.getUserId()).orElse(null);
                if (user != null) {
                    String phoneNumber = user.getPhoneNumber();
                    if (phoneNumber == null || phoneNumber.isBlank()) {
                        String digits = currentUser.getUserId().toString().replaceAll("[^0-9]", "");
                        digits = digits.length() >= 10
                                ? digits.substring(digits.length() - 10)
                                : String.format("%010d", Long.parseLong(digits.isBlank() ? "0" : digits));
                        phoneNumber = "9" + digits.substring(1);
                    }
                    patient = patientRepository.findByUser(user).orElse(null);
                    if (patient == null) {
                        patient = patientRepository.findByPhoneNumberAndDeletedFalse(phoneNumber).orElse(null);
                    }
                    if (patient == null) {
                        String displayName = currentUser.getDisplayName();
                        String firstName = "Patient";
                        String lastName = "";
                        if (displayName != null && !displayName.isBlank()) {
                            String[] parts = displayName.trim().split("\\s+", 2);
                            firstName = parts[0];
                            if (parts.length > 1) {
                                lastName = parts[1];
                            }
                        }

                        Patient created = new Patient();
                        created.setUser(user);
                        created.setFirstName(firstName);
                        created.setLastName(lastName);
                        created.setPhoneNumber(phoneNumber);
                        created.setPreferredLanguage(user.getPreferredLanguage());
                        patient = patientRepository.save(created);
                    }
                }
            }
            if (patient == null) {
                log.error("Unauthorized uploadVisit access: patient profile not found for userId={}", currentUser.getUserId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "error", "Unauthorized",
                        "message", "Patient profile not found"
                ));
            }
            log.info("[PatientVisitController] uploadVisit resolved patientId={}", patient.getId());

            LocalDate visitDate = request.getVisitDate() != null ? request.getVisitDate() : LocalDate.now();
            String visitType = request.getVisitType();
            if (visitType == null || visitType.isBlank()) {
                visitType = "General";
            }
            visitType = visitType.length() > 50 ? visitType.substring(0, 50) : visitType;
            String chiefComplaint = request.getChiefComplaint();
            if (chiefComplaint != null && chiefComplaint.length() > 2000) {
                chiefComplaint = chiefComplaint.substring(0, 2000);
            }
            String rawNotes = buildRawNotes(request);

            log.info("[PatientVisitController] uploadVisit normalized fields: visitDate={} visitType={} chiefComplaintLength={} rawNotesLength={}",
                    visitDate,
                    visitType,
                    chiefComplaint != null ? chiefComplaint.length() : 0,
                    rawNotes != null ? rawNotes.length() : 0);

            Visit visit = new Visit();
            visit.setPatient(patient);
            visit.setDoctor(null);                             // patient-uploaded; no doctor yet
            visit.setSource("PATIENT");
            visit.setVisitDate(visitDate);
            visit.setVisitType(visitType);
            visit.setChiefComplaint(chiefComplaint);
            visit.setRawNotes(rawNotes);
            visit.setStatus(VisitStatus.DRAFT);
            visit.setCreatedAt(LocalDateTime.now());
            visit.setUpdatedAt(LocalDateTime.now());

            log.info("[PatientVisitController] uploadVisit saving entity: patientId={} doctorNull={} source={} status={}",
                    patient.getId(), visit.getDoctor() == null, visit.getSource(), visit.getStatus());
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
                } catch (DataIntegrityViolationException dive) {
                    log.error("Upload error - data integrity violation", dive);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", dive.getClass().getName(),
                        "message", dive.getMostSpecificCause() != null && dive.getMostSpecificCause().getMessage() != null
                            ? dive.getMostSpecificCause().getMessage()
                            : "Invalid visit payload"
                    ));
        } catch (Throwable t) {
            log.error("Upload error", t);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", t.getClass().getName(),
                "message", t.getMessage() != null ? t.getMessage() : "Failed"
            ));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/patient/visits/{visitId}/documents
    // Attach a document or audio file to an existing patient visit
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/{visitId}/documents")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    @Operation(summary = "Upload a document or audio file to a patient visit")
    public ResponseEntity<?> uploadDocument(
            @PathVariable UUID visitId,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "OTHER") String documentType,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
                currentUser = (UserPrincipal) auth.getPrincipal();
            }
        }

        if (currentUser == null) {
            log.error("Unauthorized uploadDocument access: missing authenticated UserPrincipal");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized",
                    "message", "User is not authenticated"
            ));
        }

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

    @PostMapping("/{visitId}/audio")
    public ResponseEntity<?> uploadVisitAudio(
            @PathVariable UUID visitId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
                currentUser = (UserPrincipal) auth.getPrincipal();
            }
        }
        if (currentUser == null) {
            log.error("Unauthorized uploadVisitAudio access: missing authenticated UserPrincipal");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized",
                    "message", "User is not authenticated"
            ));
        }
        try {
            Visit visit = visitRepository.findById(visitId)
                    .orElseThrow(() -> new IllegalArgumentException("Visit not found: " + visitId));

            visit.setAudioData(file.getBytes());
            visit.setAudioFilename(file.getOriginalFilename());
            visit.setAudioContentType(file.getContentType());
            visitRepository.save(visit);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[PatientVisitController] Failed to upload audio for visitId={}", visitId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
