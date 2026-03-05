package com.shifa.integration.ocr;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class PdfTextExtractor {

    private final TesseractOcrClient tesseractClient;
    private final OcrLanguageDetector langDetector;

    public OcrResult extract(MultipartFile pdfFile) throws IOException {
        try (PDDocument doc = PDDocument.load(pdfFile.getInputStream())) {
            String layerText = new PDFTextStripper().getText(doc);

            if (layerText != null && layerText.trim().length() > 100) {
                log.info("[OCR] PDF text layer. chars={}", layerText.length());
                return OcrResult.builder()
                    .extractedText(layerText.trim())
                    .confidence(1.0)
                    .language("eng")
                    .pageCount(doc.getNumberOfPages())
                    .hasIndianScript(langDetector.containsIndianScript(layerText))
                    .processingTimeMs(0)
                    .warnings(List.of())
                    .build();
            }

            log.info("[OCR] Scanned PDF — OCR {} pages", doc.getNumberOfPages());
            return ocrScanned(doc);
        }
    }

    private OcrResult ocrScanned(PDDocument doc) throws IOException {
        PDFRenderer renderer = new PDFRenderer(doc);
        StringBuilder text  = new StringBuilder();
        double totalConf    = 0;
        int pages           = doc.getNumberOfPages();

        for (int p = 0; p < pages; p++) {
            BufferedImage img = renderer.renderImageWithDPI(p, 300);
            File tmp = File.createTempFile("shifa_ocr_p" + p + "_", ".png");
            try {
                ImageIO.write(img, "PNG", tmp);
                OcrResult pageResult = tesseractClient.extractFromFile(tmp);
                text.append(pageResult.getExtractedText()).append("\n\n--- PAGE ---\n\n");
                totalConf += pageResult.getConfidence();
            } finally { tmp.delete(); }
        }

        return OcrResult.builder()
            .extractedText(text.toString().trim())
            .confidence(pages > 0 ? totalConf / pages : 0)
            .language("eng+hin").pageCount(pages)
            .hasIndianScript(false).processingTimeMs(0)
            .warnings(List.of()).build();
    }
}
