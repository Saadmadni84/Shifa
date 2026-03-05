package com.shifa.service.language;

import com.shifa.service.ai.AIService;
import com.shifa.service.dto.VisitSummaryData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LanguageService {

    private final AIService aiService;

    public static final List<LanguageInfo> SUPPORTED_LANGUAGES = List.of(
            new LanguageInfo("hi", "Hindi", "हिन्दी", false),
            new LanguageInfo("ta", "Tamil", "தமிழ்", false),
            new LanguageInfo("te", "Telugu", "తెలుగు", false),
            new LanguageInfo("bn", "Bengali", "বাংলা", false),
            new LanguageInfo("mr", "Marathi", "मराठी", false),
            new LanguageInfo("gu", "Gujarati", "ગુજરાતી", false),
            new LanguageInfo("kn", "Kannada", "ಕನ್ನಡ", false),
            new LanguageInfo("ml", "Malayalam", "മലയാളം", false),
            new LanguageInfo("pa", "Punjabi", "ਪੰਜਾਬੀ", false),
            new LanguageInfo("ur", "Urdu", "اردو", true),
            new LanguageInfo("en", "English", "English", false));

    @Cacheable("supported-languages")
    public List<LanguageInfo> getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }

    public boolean isSupported(String languageCode) {
        return SUPPORTED_LANGUAGES.stream()
                .anyMatch(l -> l.code().equals(languageCode));
    }

    public boolean isRtl(String languageCode) {
        return "ur".equals(languageCode);
    }

    public String translateSummary(VisitSummaryData summary, String targetLanguageCode) {
        if ("en".equals(targetLanguageCode)) {
            return summary.getPatientFriendlyText();
        }
        if (!isSupported(targetLanguageCode)) {
            log.warn("[LanguageService] Unsupported language code: {}", targetLanguageCode);
            return summary.getPatientFriendlyText();
        }

        String englishContent = summary.getPatientFriendlyText();
        if (englishContent == null)
            return null;

        return aiService.translateText(englishContent, targetLanguageCode);
    }

    public record LanguageInfo(String code, String name, String nativeName, boolean rtl) {
    }
}
