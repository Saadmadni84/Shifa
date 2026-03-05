package com.shifa.common.enums;

import lombok.Getter;

@Getter
public enum Language {
    ENGLISH("en", "English", "English"),
    HINDI("hi", "Hindi", "हिंदी"),
    BENGALI("bn", "Bengali", "বাংলা"),
    TELUGU("te", "Telugu", "తెలుగు"),
    MARATHI("mr", "Marathi", "मराठी"),
    TAMIL("ta", "Tamil", "தமிழ்"),
    URDU("ur", "Urdu", "اردو"),
    GUJARATI("gu", "Gujarati", "ગુજરાતી"),
    KANNADA("kn", "Kannada", "ಕನ್ನಡ"),
    ODIA("or", "Odia", "ଓଡ଼ିଆ"),
    MALAYALAM("ml", "Malayalam", "മലയാളം"),
    PUNJABI("pa", "Punjabi", "ਪੰਜਾਬੀ");

    private final String code;
    private final String englishName;
    private final String nativeName;

    Language(String code, String englishName, String nativeName) {
        this.code = code;
        this.englishName = englishName;
        this.nativeName = nativeName;
    }
}
