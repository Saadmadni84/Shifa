package com.shifa.integration.translation;

import com.shifa.integration.translation.exception.TranslationException;
import org.springframework.stereotype.Component;

@Component
public class DeepLClient {
    public String translate(String text, String targetLang) throws TranslationException {
        // Implementation for calling DeepL translation API
        return text;
    }
}
