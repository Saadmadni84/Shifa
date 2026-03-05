package com.shifa.service;

import com.shifa.dto.LanguageDTO;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class LanguageService {

    /**
     * Retrieves the list of all supported languages for the Shifa application.
     * Including 12 Indian regional languages + English.
     */
    public List<LanguageDTO> getSupportedLanguages() {
        return Arrays.asList(
                createLang("en", "English", "English", false),
                createLang("hi", "Hindi", "हिन्दी", false),
                createLang("ta", "Tamil", "தமிழ்", false),
                createLang("te", "Telugu", "తెలుగు", false),
                createLang("bn", "Bengali", "বাংলা", false),
                createLang("mr", "Marathi", "मराठी", false),
                createLang("gu", "Gujarati", "ગુજરાતી", false),
                createLang("kn", "Kannada", "ಕನ್ನಡ", false),
                createLang("ml", "Malayalam", "മലയാളം", false),
                createLang("pa", "Punjabi", "ਪੰਜਾਬੀ", false),
                createLang("or", "Odia", "ଓଡ଼ିଆ", false),
                createLang("ur", "Urdu", "اردو", true)
        );
    }

    private LanguageDTO createLang(String code, String name, String nativeName, boolean isRtl) {
        return LanguageDTO.builder()
                .code(code)
                .name(name)
                .nativeName(nativeName)
                .isRtl(isRtl)
                .isActive(true)
                .build();
    }
}
