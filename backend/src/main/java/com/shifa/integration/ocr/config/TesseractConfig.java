package com.shifa.integration.ocr.config;

import com.shifa.integration.ocr.config.TesseractProperties;
import net.sourceforge.tess4j.Tesseract;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@RequiredArgsConstructor
public class TesseractConfig {

    private final TesseractProperties props;

    @Bean
    @Scope("prototype")
    public Tesseract tesseract() {
        Tesseract t = new Tesseract();
        t.setDatapath(props.getDataPath());
        t.setLanguage(props.getDefaultLanguages());
        t.setPageSegMode(1);    // Auto page segmentation with OSD
        t.setOcrEngineMode(1);  // LSTM neural nets
        return t;
    }
}
