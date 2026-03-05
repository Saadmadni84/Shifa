package com.shifa.integration.ocr;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OcrResult {
    private String extractedText;
    private double confidence;
    private String language;
    private int pageCount;
    private boolean hasIndianScript;
    private long processingTimeMs;
    private List<String> warnings;
}
