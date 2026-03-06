package com.shifa.integration.ocr;

import com.shifa.integration.ocr.exception.OcrException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.context.ApplicationContext;
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
public class TesseractOcrClient {

    private final ApplicationContext context;
    private final ImagePreprocessor preprocessor;
    private final OcrLanguageDetector langDetector;

    public OcrResult extract(MultipartFile imageFile) throws IOException {
        long start = System.currentTimeMillis();
        BufferedImage image = ImageIO.read(imageFile.getInputStream());
        if (image == null) throw new OcrException("Cannot read image");

        String langPack = langDetector.detectLanguagePack(image);
        BufferedImage processed = preprocessor.preprocess(image);

        Tesseract tesseract = context.getBean(Tesseract.class);
        tesseract.setLanguage(langPack);

        try {
            String text = tesseract.doOCR(processed);
            double conf = estimateConfidence(text);

            return OcrResult.builder()
                .extractedText(text.trim())
                .confidence(conf)
                .language(langPack)
                .pageCount(1)
                .hasIndianScript(langDetector.containsIndianScript(text))
                .processingTimeMs(System.currentTimeMillis() - start)
                .warnings(conf < 0.3 ? List.of("Low OCR confidence") : List.of())
                .build();

        } catch (TesseractException e) {
            throw new OcrException("Tesseract OCR failed", e);
        }
    }

    public OcrResult extractFromFile(File file) throws IOException {
        long start = System.currentTimeMillis();
        Tesseract tesseract = context.getBean(Tesseract.class);
        try {
            String text = tesseract.doOCR(file);
            return OcrResult.builder()
                .extractedText(text.trim())
                .confidence(estimateConfidence(text))
                .language("eng+hin")
                .pageCount(1)
                .hasIndianScript(false)
                .processingTimeMs(System.currentTimeMillis() - start)
                .warnings(List.of())
                .build();
        } catch (TesseractException e) {
            throw new OcrException("Tesseract OCR failed on file", e);
        }
    }

    private double estimateConfidence(String text) {
        if (text == null || text.isBlank()) return 0.0;
        long unknowns = text.chars().filter(c -> c == '?' || c == '□').count();
        return Math.max(0.0, 1.0 - (double) unknowns / text.length() * 5);
    }
}
