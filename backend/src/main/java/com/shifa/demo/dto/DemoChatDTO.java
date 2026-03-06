package com.shifa.demo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

/**
 * DTOs for the demo AI chat endpoint.
 *
 * POST /api/v1/demo/patients/{patientId}/visits/{visitId}/chat
 */
public class DemoChatDTO {

    /**
     * Request body sent by the frontend.
     */
    @Value
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Request {

        @NotBlank(message = "Message cannot be blank")
        @Size(max = 2000, message = "Message must not exceed 2000 characters")
        String message;

        /**
         * Language code for the AI response.
         * Defaults to "en" if not provided.
         * Supported: en, hi, gu, kn, ta, te, mr, bn, ml, pa, or, ur
         */
        String languageCode;
    }

    /**
     * Non-streaming response (used in demo — no SSE overhead needed).
     */
    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        String  messageId;
        String  role;        // "assistant"
        String  content;
        String  languageCode;
        boolean isDemoMode;  // Always true in demo
        String  disclaimer;  // Shown below AI answer
    }

    /**
     * AI audit log item (doctor panel — AI transparency trail).
     */
    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AuditItem {
        String  id;
        String  timestamp;
        String  question;
        String  aiSummary;
        boolean reviewedByDoctor;
        String  severity;    // "info" | "flagged"
    }
}