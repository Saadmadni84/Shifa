package com.shifa.domain.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
@NoArgsConstructor
public class DocumentUploadRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private UUID visitId;

    @NotBlank(message = "Document type is required")
    @Pattern(regexp = "PRESCRIPTION|LAB_REPORT|SCAN|ID_PROOF|OTHER",
             message = "Invalid document type")
    private String documentType;

    @NotNull(message = "File is required")
    private MultipartFile file;

    private boolean extractText = false;
}
