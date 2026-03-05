package com.shifa.domain.document.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class DocumentUploadResponse {
    private UUID id;
    private String originalFilename;
    private String documentType;
    private String status;
}
