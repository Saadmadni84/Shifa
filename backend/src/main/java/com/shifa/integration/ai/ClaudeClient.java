package com.shifa.integration.ai;

import org.springframework.stereotype.Component;

@Component
public class ClaudeClient {

    public ClaudeResponse summarize(ClaudeRequest request) {
        ClaudeResponse response = new ClaudeResponse();
        response.setSummary("Structured summary placeholder");
        return response;
    }

    public ClaudeResponse sendMessage(String message, String context) {
        ClaudeResponse response = new ClaudeResponse();
        response.setSummary("AI response placeholder for: " + message);
        return response;
    }
}
