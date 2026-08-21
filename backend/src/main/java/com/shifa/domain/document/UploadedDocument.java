package com.shifa.domain.document;

import com.shifa.common.audit.RedisAuditableEntity;
import com.shifa.common.enums.DocumentType;
import com.shifa.common.enums.OcrStatus;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.redis.core.RedisHash;

@RedisHash("document")
@Table(name = "uploaded_documents")
@Getter @Setter @NoArgsConstructor
public class UploadedDocument extends RedisAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit visit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "original_filename", length = 500)
    private String originalFilename;

    @Column(name = "s3_key", nullable = false, length = 500)
    private String s3Key;

    @Column(name = "s3_bucket", length = 100)
    private String s3Bucket;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type")
    private DocumentType documentType;

    @Column(name = "ocr_text", columnDefinition = "TEXT")
    private String ocrText;

    @Enumerated(EnumType.STRING)
    @Column(name = "ocr_status")
    private OcrStatus ocrStatus = OcrStatus.PENDING;

    @Column(name = "ocr_confidence")
    private Double ocrConfidence;

    @Column(name = "ocr_language", length = 10)
    private String ocrLanguage;

    @Transient
    private String presignedUrl;
}
