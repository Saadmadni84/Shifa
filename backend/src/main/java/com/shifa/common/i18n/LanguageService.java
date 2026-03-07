package com.shifa.common.i18n;

import java.util.Locale;

import org.springframework.stereotype.Service;

@Service("coreLanguageService")
public class LanguageService {

    public Locale resolveLocale(String languageCode) {
        return Locale.forLanguageTag(languageCode == null ? "en" : languageCode);
    }
}
