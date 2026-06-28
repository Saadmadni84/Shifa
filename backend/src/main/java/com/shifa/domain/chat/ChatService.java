package com.shifa.domain.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.common.enums.ChatRole;
import com.shifa.domain.chat.dto.ChatRequest;
import com.shifa.domain.chat.dto.ChatResponse;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final VisitRepository visitRepository;
    private final ObjectMapper objectMapper;

    @Value("${shifa.rag.base-url:http://localhost:5050}")
    private String ragBaseUrl;

    public ChatResponse askQuestion(String visitToken, ChatRequest request) {
        // 1. Find the visit by portal token
        Visit visit = visitRepository.findByPatientPortalToken(visitToken)
            .orElseThrow(() -> new RuntimeException("Visit not found for token: " + visitToken));

        String patientId = visit.getPatient().getId().toString();
        String visitId = visit.getId().toString();

        // 2. Get or create chat session
        ChatSession session = chatSessionRepository.findByVisitId(visit.getId())
            .orElseGet(() -> {
                ChatSession newSession = new ChatSession();
                newSession.setVisit(visit);
                newSession.setPatientLanguage(request.getLanguage());
                return chatSessionRepository.save(newSession);
            });

        // 3. Save user message
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSession(session);
        userMsg.setRole(ChatRole.USER);
        userMsg.setContent(request.getQuestion());
        userMsg.setLanguageCode(request.getLanguage());
        chatMessageRepository.save(userMsg);

        // 4. Call RAG service
        String answer;
        try {
            answer = callRagService(patientId, visitId, request.getQuestion(), request.getLanguage());
        } catch (Exception e) {
            log.error("[Chat] RAG service error: {}", e.getMessage(), e);
            answer = "I'm sorry, I'm having trouble accessing your records right now. Please try again in a moment.";
        }

        // 5. Save assistant response
        ChatMessage assistantMsg = new ChatMessage();
        assistantMsg.setSession(session);
        assistantMsg.setRole(ChatRole.ASSISTANT);
        assistantMsg.setContent(answer);
        assistantMsg.setLanguageCode(request.getLanguage());
        chatMessageRepository.save(assistantMsg);

        // 6. Update session stats
        session.setTotalMessages(session.getTotalMessages() + 2);
        session.setLastMessageAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        return ChatResponse.builder()
            .answer(answer)
            .messageId(assistantMsg.getId())
            .sessionId(session.getId())
            .build();
    }

    private String callRagService(String patientId, String visitId, String question, String language) {
        WebClient webClient = WebClient.create(ragBaseUrl);

        Map<String, String> body = new HashMap<>();
        body.put("patientId", patientId);
        body.put("visitId", visitId);
        body.put("question", question);
        if (language != null) {
            body.put("language", language);
        }

        String responseBody = webClient.post()
            .uri("/api/rag/visit-chat")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        try {
            JsonNode json = objectMapper.readTree(responseBody);
            String answer = json.has("answer") ? json.get("answer").asText() : "No answer available.";
            String disclaimer = json.has("disclaimer") ? json.get("disclaimer").asText() : "";
            return answer + (disclaimer.isEmpty() ? "" : "\n\n" + disclaimer);
        } catch (Exception e) {
            log.error("[Chat] Failed to parse RAG response: {}", e.getMessage());
            return responseBody;
        }
    }
}
