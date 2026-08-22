package com.shifa.domain.document;

import com.shifa.domain.document.dto.DocumentUploadResponse;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.security.dto.UserPrincipal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Document")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final DocumentService documentService;
    private final PatientRepository patientRepository;
    private final DocumentRepository documentRepository;
    private final com.shifa.integration.storage.S3StorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponse> upload(
        @RequestParam(required = false) UUID patientId,
        @RequestParam(required = false) UUID visitId,
        @RequestParam MultipartFile file,
        @org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null && "PATIENT".equalsIgnoreCase(currentUser.getRole())) {
            patientId = patientRepository.findByUserId(currentUser.getUserId())
                    .orElseThrow(() -> new IllegalStateException("Patient profile not found"))
                    .getId();
        }
        return ResponseEntity.ok(documentService.uploadDocument(patientId, visitId, file));
    }

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<UploadedDocument>> getByVisit(@PathVariable UUID visitId) {
        List<UploadedDocument> documents = documentService.listByVisit(visitId);
        UserPrincipal principal = currentPatientOrNull();
        if (principal != null) {
            UUID patientId = patientRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("Patient profile not found"))
                .getId();
            documents = documents.stream()
                .filter(document -> document.getPatient() != null && patientId.equals(document.getPatient().getId()))
                .toList();
        }
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<UploadedDocument>> getByPatient(@PathVariable UUID patientId) {
        requireOwnPatient(patientId);
        return ResponseEntity.ok(documentService.listByPatient(patientId));
    }

    @GetMapping("/{documentId}/url")
    public ResponseEntity<Map<String, String>> getDocumentUrl(@PathVariable UUID documentId) {
        requireOwnDocument(documentId);
        return ResponseEntity.ok(documentService.getDocumentUrl(documentId));
    }

    @GetMapping("/local-download")
    public ResponseEntity<byte[]> localDownload(@RequestParam String key) {
        UserPrincipal principal = currentPatient();
        UUID patientId = patientRepository.findByUserId(principal.getUserId())
            .orElseThrow(() -> new IllegalStateException("Patient profile not found"))
            .getId();
        UploadedDocument document = documentRepository.findByS3Key(key)
            .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Document not found"));
        if (document.getPatient() == null || !patientId.equals(document.getPatient().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Document access denied");
        }
        byte[] content = storageService.downloadFile(key);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable UUID documentId) {
        requireOwnDocument(documentId);
        documentService.delete(documentId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{documentId}/ocr")
    public ResponseEntity<Map<String, Object>> runOcr(@PathVariable UUID documentId) {
        requireOwnDocument(documentId);
        return ResponseEntity.ok(documentService.runOcr(documentId));
    }

    @GetMapping("/{documentId}/ocr")
    public ResponseEntity<Map<String, Object>> getOcr(@PathVariable UUID documentId) {
        requireOwnDocument(documentId);
        return ResponseEntity.ok(documentService.getOcr(documentId));
    }

    private void requireOwnPatient(UUID patientId) {
        UserPrincipal principal = currentPatient();
        UUID authenticatedPatientId = patientRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("Patient profile not found"))
                .getId();
        if (!authenticatedPatientId.equals(patientId)) {
            throw new org.springframework.security.access.AccessDeniedException("Document access denied");
        }
    }

    private void requireOwnDocument(UUID documentId) {
        UserPrincipal principal = currentPatient();
        UUID authenticatedPatientId = patientRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("Patient profile not found"))
                .getId();
        UploadedDocument document = documentService.get(documentId);
        if (document.getPatient() == null || !authenticatedPatientId.equals(document.getPatient().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Document access denied");
        }
    }

    private UserPrincipal currentPatient() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new org.springframework.security.access.AccessDeniedException("Patient authentication required");
        }
        return userPrincipal;
    }

    private UserPrincipal currentPatientOrNull() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        return "PATIENT".equalsIgnoreCase(principal.getRole()) ? principal : null;
    }
}
