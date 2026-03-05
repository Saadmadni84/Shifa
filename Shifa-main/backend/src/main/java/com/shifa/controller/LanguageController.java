package com.shifa.controller;

import com.shifa.dto.LanguageDTO;
import com.shifa.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
public class LanguageController {

    private final LanguageService languageService;

    /**
     * Get all supported languages for the application
     * @return List of supported languages
     */
    @GetMapping
    public ResponseEntity<List<LanguageDTO>> getSupportedLanguages() {
        return ResponseEntity.ok(languageService.getSupportedLanguages());
    }
}
