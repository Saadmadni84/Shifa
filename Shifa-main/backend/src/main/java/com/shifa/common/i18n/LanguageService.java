package com.shifa.common.i18n;

import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class LanguageService {

    public Locale resolveLocale(String languageCode) {
        return Locale.forLanguageTag(languageCode == null ? "en" : languageCode);
    }
}
