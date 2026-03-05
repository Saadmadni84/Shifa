package com.shifa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LanguageDTO {
    private String code;         // e.g. "en", "hi", "mr"
    private String name;         // e.g. "English", "हिन्दी", "मराठी"
    private String nativeName;   // The name of the language in that language
    private boolean isRtl;       // Whether the language uses Right-to-Left script (e.g. Urdu)
    private boolean isActive;    // Is this language currently enabled in the app
}
