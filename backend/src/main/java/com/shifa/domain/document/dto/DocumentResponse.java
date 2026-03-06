package com.shifa.domain.document.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DocumentResponse {

    String id;
    String patientId;
    String visitId;

    String fileName;
    String fileType;
    String documentType;
    Long fileSize;

    String url;
    String status;

    boolean ocrProcessed;
    String ocrText;

    LocalDateTime uploadedAt;
}
