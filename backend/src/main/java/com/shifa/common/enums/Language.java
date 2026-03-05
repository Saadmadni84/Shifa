package com.shifa.common.enums;

import java.util.Arrays;

public enum Language {
    EN("English", "en"),
    HI("Hindi", "hi"),
    TA("Tamil", "ta"),
    TE("Telugu", "te"),
    BN("Bengali", "bn"),
    MR("Marathi", "mr"),
    GU("Gujarati", "gu"),
    KN("Kannada", "kn"),
    ML("Malayalam", "ml"),
    PA("Punjabi", "pa"),
    UR("Urdu", "ur"),
    OR("Odia", "or");

    private final String displayName;
    private final String code;

    Language(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCode() {
        return code;
    }

    public static Language fromCode(String code) {
        return Arrays.stream(values())
            .filter(l -> l.code.equalsIgnoreCase(code))
            .findFirst()
            .orElse(EN);
    }
}
