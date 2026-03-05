package com.shifa.integration.ocr.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OcrResponse {
    private boolean success;
    private String text;
    private String errorMessage;
    private double confidenceScore;
}
