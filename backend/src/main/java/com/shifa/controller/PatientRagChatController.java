package com.shifa.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.domain.user.UserRepository;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.security.dto.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@RestController
@RequestMapping("/api/patient/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient RAG Chat")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class PatientRagChatController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final VisitRepository visitRepository;
    private final ObjectMapper objectMapper;

    @Value("${shifa.rag.base-url:http://localhost:8000}")
    private String ragBaseUrl;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientChatRequest {
        private String question;
        private String sessionId;
        private String language;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientChatResponse {
        private String answer;
        private String sessionId;
        private List<Object> sources;
        private boolean retrievalPerformed;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Chat with Shifa AI using authenticated patient's RAG vector database")
    public ResponseEntity<?> chat(
            @RequestBody PatientChatRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
                currentUser = (UserPrincipal) auth.getPrincipal();
            }
        }
        if (currentUser == null || currentUser.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Unauthorized",
                "message", "User is not authenticated"
            ));
        }

        UUID userId = currentUser.getUserId();
        Patient patient = resolvePatient(userId, currentUser);
        if (patient == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "PatientProfileNotFound",
                "message", "Could not locate patient profile"
            ));
        }

        String patientId = patient.getId().toString();
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = "patient-session-" + patientId;
        }

        String question = request.getQuestion() != null ? request.getQuestion().trim() : "";
        if (question.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty"));
        }

        log.info("[PatientRagChat] Chat turn: userId={} patientId={} sessionId={}",
            userId, patientId, sessionId);

        try {
            WebClient webClient = WebClient.create(ragBaseUrl);

            Map<String, Object> body = new HashMap<>();
            body.put("session_id", sessionId);
            body.put("question", question);
            body.put("patient_id", patientId);

            String responseBody = webClient.post()
                    .uri("/api/v1/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseBody != null && !responseBody.isBlank()) {
                JsonNode json = objectMapper.readTree(responseBody);
                String answer = json.has("answer") ? json.get("answer").asText() : "";
                String resSessionId = json.has("session_id") ? json.get("session_id").asText() : sessionId;
                boolean retrievalPerformed = json.has("retrieval_performed") && json.get("retrieval_performed").asBoolean();

                List<Object> sources = new ArrayList<>();
                if (json.has("sources") && json.get("sources").isArray()) {
                    for (JsonNode srcNode : json.get("sources")) {
                        sources.add(objectMapper.convertValue(srcNode, Object.class));
                    }
                }

                return ResponseEntity.ok(PatientChatResponse.builder()
                        .answer(answer)
                        .sessionId(resSessionId)
                        .sources(sources)
                        .retrievalPerformed(retrievalPerformed)
                        .build());
            }
        } catch (Exception e) {
            log.error("[PatientRagChat] Error connecting to RAG service at {}: {}", ragBaseUrl, e.getMessage());
        }

        // Fallback response if RAG service call fails
        String fallbackAnswer = generateFallbackAnswer(patient, question);
        return ResponseEntity.ok(PatientChatResponse.builder()
                .answer(fallbackAnswer)
                .sessionId(sessionId)
                .sources(Collections.emptyList())
                .retrievalPerformed(false)
                .build());
    }

    private Patient resolvePatient(UUID userId, UserPrincipal currentUser) {
        return patientRepository.findByUserId(userId)
                .orElseGet(() -> {
                    var user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        return patientRepository.findByUser(user).orElseGet(() -> {
                            Patient created = new Patient();
                            created.setUser(user);
                            created.setFirstName(currentUser.getDisplayName() != null ? currentUser.getDisplayName() : "Patient");
                            created.setPhoneNumber(user.getPhoneNumber());
                            created.setPreferredLanguage(user.getPreferredLanguage());
                            return patientRepository.save(created);
                        });
                    }
                    return null;
                });
    }

    private String generateFallbackAnswer(Patient patient, String question) {
        int visitCount = visitRepository.findByPatientId(patient.getId()).size();
        String q = question.toLowerCase();

        if (q.contains("hi") || q.contains("hello") || q.contains("hey")) {
            return "Hello " + patient.getFirstName() + ". How can I help you today?";
        } else if (q.contains("name")) {
            return "Your name is " + patient.getFullName() + ".";
        } else if (q.contains("medication") || q.contains("medicine")) {
            String medications = patient.getCurrentMedicinesText();
            return "Not specified".equalsIgnoreCase(medications)
                    ? "You currently don't have any medications recorded in your Shifa health profile."
                    : "Your current medications are " + medications + ".";
        } else if (q.contains("diagnos") || q.contains("condition")) {
            return "Your recorded conditions are " + patient.getKnownConditionsText() + ".";
        } else if (q.contains("visit") || q.contains("history") || q.contains("record")) {
            return "You currently have " + visitCount + " visit(s) recorded in your Shifa profile. Upload new visits or documents to index them into your AI health assistant.";
        } else {
            return "I could not access the AI service right now. Please try again shortly.";
        }
    }
}
