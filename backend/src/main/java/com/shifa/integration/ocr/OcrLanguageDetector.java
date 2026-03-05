package com.shifa.integration.ocr;

import org.springframework.stereotype.Component;

import java.awt.image.BufferedImage;

@Component
public class OcrLanguageDetector {

    public String detectLanguagePack(BufferedImage image) {
        // Implementation for language pack detection. For now returning default eng+hin
        return "eng+hin";
    }

    public boolean containsIndianScript(String text) {
        if (text == null) return false;
        return text.codePoints().anyMatch(cp ->
            (cp >= 0x0900 && cp <= 0x097F)   // Devanagari
         || (cp >= 0x0B80 && cp <= 0x0BFF)   // Tamil
         || (cp >= 0x0C00 && cp <= 0x0C7F)   // Telugu
         || (cp >= 0x0980 && cp <= 0x09FF)   // Bengali
         || (cp >= 0x0A80 && cp <= 0x0AFF)   // Gujarati
         || (cp >= 0x0C80 && cp <= 0x0CFF)   // Kannada
         || (cp >= 0x0D00 && cp <= 0x0D7F)); // Malayalam
    }
}
