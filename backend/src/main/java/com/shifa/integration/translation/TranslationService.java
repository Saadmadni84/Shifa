package com.shifa.integration.translation;

import com.shifa.common.enums.Language;
import com.shifa.integration.ai.AIPromptService;
import com.shifa.integration.translation.config.DeepLProperties;
import com.shifa.integration.translation.exception.TranslationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TranslationService {

    private final DeepLClient deepLClient;
    private final AIPromptService aiPromptService;
    private final TranslationCache cache;
    private final DeepLProperties props;

    public String translate(String text, Language target) {
        if (target == Language.EN) return text;

        String key    = "translation:" + target.getCode() + ":" + text.hashCode();
        String cached = cache.get(key);
        if (cached != null) { log.debug("[Translation] Cache hit. lang={}", target); return cached; }

        String result = performTranslation(text, target);
        cache.put(key, result);
        return result;
    }

    private String performTranslation(String text, Language target) {
        if (props.isEnabled()) {
            try {
                log.info("[Translation] DeepL. lang={}", target);
                return deepLClient.translate(text, target.getCode());
            } catch (TranslationException e) {
                log.warn("[Translation] DeepL failed, falling back to Claude. lang={}", target);
            }
        }
        log.info("[Translation] Claude. lang={}", target);
        return aiPromptService.translateWithClaude(text, target);
    }
}
