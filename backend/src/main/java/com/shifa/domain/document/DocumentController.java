package com.shifa.domain.document;

import com.shifa.domain.document.dto.DocumentUploadResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponse> upload(
        @RequestParam(required = false) UUID patientId,
        @RequestParam(required = false) UUID visitId,
        @RequestParam MultipartFile file) {
        return ResponseEntity.ok(documentService.uploadDocument(patientId, visitId, file));
    }

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<UploadedDocument>> getByVisit(@PathVariable UUID visitId) {
        return ResponseEntity.ok(documentService.listByVisit(visitId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<UploadedDocument>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(documentService.listByPatient(patientId));
    }

    @GetMapping("/{documentId}/url")
    public ResponseEntity<Map<String, String>> getDocumentUrl(@PathVariable UUID documentId) {
        return ResponseEntity.ok(documentService.getDocumentUrl(documentId));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable UUID documentId) {
        documentService.delete(documentId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{documentId}/ocr")
    public ResponseEntity<Map<String, Object>> runOcr(@PathVariable UUID documentId) {
        return ResponseEntity.ok(documentService.runOcr(documentId));
    }

    @GetMapping("/{documentId}/ocr")
    public ResponseEntity<Map<String, Object>> getOcr(@PathVariable UUID documentId) {
        return ResponseEntity.ok(documentService.getOcr(documentId));
    }
}
