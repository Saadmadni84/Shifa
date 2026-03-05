package com.shifa.integration.ai;

import org.springframework.stereotype.Service;

@Service
public class AIPromptService {

    public String buildVisitPrompt(String notes) {
        return "Convert clinical notes into patient-friendly summary: " + notes;
    }
}
