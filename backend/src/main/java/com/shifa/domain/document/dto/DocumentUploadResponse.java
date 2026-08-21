package com.shifa.domain.document.dto;

import lombok.Data;

@Data
public class DocumentUploadResponse {
    private String id;
    private String originalFilename;
    private String documentType;
    private String status;
}
