package com.shifa.integration.ocr.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "integration.tesseract")
@Data
@Validated
public class TesseractProperties {
    @NotBlank private String dataPath;
    @NotBlank private String defaultLanguages;
    private int minConfidenceThreshold = 30;
    private int ocrTimeoutSeconds = 30;
}
