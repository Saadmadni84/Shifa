package com.shifa.integration.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.domain.visit.VisitSummaryData;
import com.shifa.integration.ai.exception.AIParsingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AIResponseParser {

    private final ObjectMapper objectMapper;

    public VisitSummaryData parseVisitSummary(String raw) {
        String json = extractJson(raw);
        try {
            VisitSummaryData data = objectMapper.readValue(json, VisitSummaryData.class);
            if (data.getDiagnosis() == null || data.getDiagnosis().isBlank()) {
                log.warn("[AI] Empty diagnosis — notes may be too brief");
            }
            return data;
        } catch (JsonProcessingException e) {
            log.error("[AI] JSON parse failed. Snippet: {}",
                json.substring(0, Math.min(300, json.length())));
            throw new AIParsingException("AI returned malformed JSON", e);
        }
    }

    public String extractJson(String response) {
        if (response == null || response.isBlank()) {
            throw new AIParsingException("Empty AI response");
        }
        // Strip markdown code fences
        String cleaned = response
            .replaceAll("(?s)```json\\s*", "")
            .replaceAll("(?s)```\\s*", "")
            .trim();

        int start = cleaned.indexOf('{');
        int end   = cleaned.lastIndexOf('}');

        if (start == -1 || end == -1 || start >= end) {
            throw new AIParsingException("No JSON object in AI response: " + cleaned);
        }
        return cleaned.substring(start, end + 1);
    }
}
