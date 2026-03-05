package com.shifa.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.service.dto.VisitSummaryData;
import com.shifa.service.exception.AIProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AISummaryParser {

    private final ObjectMapper objectMapper;

    public VisitSummaryData parse(String rawResponse) {
        String cleaned = extractJson(rawResponse);

        try {
            return objectMapper.readValue(cleaned, VisitSummaryData.class);
        } catch (Exception e) {
            log.error("[AISummaryParser] Failed to parse. Raw response:\n{}", rawResponse);
            throw new AIProcessingException(
                    "AI returned an unexpected response format. Please try again.", e);
        }
    }

    private String extractJson(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new AIProcessingException("AI returned an empty response.");
        }

        String cleaned = raw
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();

        if (cleaned.startsWith("{")) {
            return cleaned;
        }

        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }

        throw new AIProcessingException(
                "AI response contains no valid JSON block. Response preview: " +
                        cleaned.substring(0, Math.min(200, cleaned.length())));
    }
}
