package com.shifa.service.document;

import com.shifa.integration.ocr.OcrResult;
import com.shifa.integration.ocr.PdfTextExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientDocumentRagService {

    private final PdfTextExtractor pdfTextExtractor;
    private final JdbcTemplate jdbcTemplate;

    @Value("${shifa.rag.base-url:http://localhost:8000}")
    private String ragBaseUrl;

    public void prepareAndIndex(UUID documentId, UUID patientId, MultipartFile file) {
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            return;
        }

        try {
            OcrResult result = pdfTextExtractor.extract(file);
            jdbcTemplate.update("""
                    INSERT INTO ocr_results (document_id, raw_text, confidence_score, processed_at)
                    VALUES (?, ?, ?, NOW())
                    ON CONFLICT (document_id) DO UPDATE SET
                        raw_text = EXCLUDED.raw_text,
                        confidence_score = EXCLUDED.confidence_score,
                        processed_at = EXCLUDED.processed_at
                    """,
                    documentId, result.getExtractedText(), result.getConfidence());
            jdbcTemplate.update("UPDATE uploaded_documents SET is_ocr_processed = TRUE WHERE id = ?",
                    documentId);

            WebClient.create(ragBaseUrl)
                    .post()
                    .uri("/api/v1/index/patient/{patientId}", patientId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .toBodilessEntity()
                    .subscribe(
                            ignored -> log.info("[RAG] Patient document indexed: patientId={} documentId={}", patientId, documentId),
                            error -> log.warn("[RAG] Indexing deferred/failed: patientId={} documentId={} reason={}",
                                    patientId, documentId, error.getMessage()));
        } catch (Exception e) {
            log.warn("[RAG] Document preparation failed; upload remains stored: documentId={} reason={}",
                    documentId, e.getMessage());
        }
    }
}