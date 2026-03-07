package com.shifa.service.document;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service("documentOcrService")
@Slf4j
public class OCRService {

    public String extractTextFromImage(String imageUrl) {
        log.info("[OCRService] Extracting text from image: {}", imageUrl);

        return "Extracted OCR text dummy response for now.";
    }
}
