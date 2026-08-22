package com.shifa.domain.document;

import com.shifa.common.enums.DocumentType;
import com.shifa.common.enums.OcrStatus;
import com.shifa.domain.document.dto.DocumentUploadResponse;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.integration.storage.S3StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service("domainDocumentService")
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final S3StorageService s3StorageService;

    public DocumentUploadResponse uploadDocument(UUID patientId, UUID visitId, MultipartFile file) {
        Visit visit = null;
        if (visitId != null) {
            visit = visitRepository.findById(visitId)
                    .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
        }

        Patient patient;
        if (patientId != null) {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        } else if (visit != null && visit.getPatient() != null) {
            patient = visit.getPatient();
        } else {
            throw new IllegalArgumentException("patientId or visitId with patient is required");
        }

        UploadedDocument doc = new UploadedDocument();
        doc.setPatient(patient);
        doc.setVisit(visit);
        doc.setOriginalFilename(file.getOriginalFilename());
        doc.setMimeType(file.getContentType());
        doc.setFileSizeBytes(file.getSize());
        doc.setDocumentType(DocumentType.OTHER);
        try {
            doc.setS3Key(s3StorageService.uploadFile(file, "documents", patient.getId()));
        } catch (Exception storageFailure) {
            throw new IllegalStateException("Document storage failed", storageFailure);
        }
        doc.setOcrStatus(OcrStatus.PENDING);
        doc.setCreatedAt(LocalDateTime.now());

        UploadedDocument saved = documentRepository.save(doc);

        DocumentUploadResponse response = new DocumentUploadResponse();
        response.setId(saved.getId().toString());
        response.setOriginalFilename(saved.getOriginalFilename());
        response.setDocumentType(saved.getDocumentType() != null ? saved.getDocumentType().name() : null);
        response.setStatus("UPLOADED");
        return response;
    }

    @Transactional(readOnly = true)
    public List<UploadedDocument> listByVisit(UUID visitId) {
        return documentRepository.findByVisitId(visitId);
    }

    @Transactional(readOnly = true)
    public List<UploadedDocument> listByPatient(UUID patientId) {
        return documentRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public Map<String, String> getDocumentUrl(UUID documentId) {
        UploadedDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        return Map.of("url", s3StorageService.generatePresignedUrl(doc.getS3Key()));
    }

    @Transactional(readOnly = true)
    public UploadedDocument get(UUID documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
    }

    public void delete(UUID documentId) {
        documentRepository.deleteById(documentId);
    }

    public Map<String, Object> runOcr(UUID documentId) {
        UploadedDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        doc.setOcrStatus(OcrStatus.COMPLETE);
        doc.setOcrText(doc.getOcrText() != null ? doc.getOcrText() : "OCR not configured in dev mode");
        doc.setUpdatedAt(LocalDateTime.now());
        documentRepository.save(doc);
        return Map.of("status", doc.getOcrStatus().name());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOcr(UUID documentId) {
        UploadedDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        return Map.of(
                "status", doc.getOcrStatus().name(),
                "text", doc.getOcrText() == null ? "" : doc.getOcrText());
    }
}
