package com.shifa.service.ai;

import com.shifa.integration.ai.ClaudeClient;
import com.shifa.security.annotation.RateLimited;
import com.shifa.service.dto.VisitSummaryData;
import com.shifa.domain.visit.Visit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ClaudeClient claudeClient;
    private final AIPromptBuilder promptBuilder;
    private final AISummaryParser summaryParser;

    @RateLimited(key = "ai_processing", limit = 200, per = "DAY")
    public VisitSummaryData generateVisitSummary(Visit visit) {
        log.info("[AIService] Generating summary: visitId={} lang={}",
                visit.getId(), visit.getPatient().getPreferredLanguage());

        String systemPrompt = promptBuilder.buildVisitSummarySystemPrompt();
        String userPrompt = promptBuilder.buildVisitSummaryUserPrompt(visit);

        String rawResponse = claudeClient.sendMessage(systemPrompt, userPrompt);
        VisitSummaryData result = summaryParser.parse(rawResponse);

        log.info("[AIService] Summary generated: visitId={} diagnosis={}",
                visit.getId(), result.getDiagnosis());

        return result;
    }

    @RateLimited(key = "ai_translation", limit = 500, per = "DAY")
    public String generatePatientFriendlyText(VisitSummaryData summary, String languageCode) {
        log.info("[AIService] Generating patient text in language={}", languageCode);

        String systemPrompt = promptBuilder.buildPatientTextSystemPrompt(languageCode);
        String userPrompt = promptBuilder.buildPatientTextUserPrompt(summary, languageCode);

        return claudeClient.sendMessage(systemPrompt, userPrompt);
    }

    @RateLimited(key = "patient_chat", limit = 50, per = "HOUR")
    public String answerPatientQuestion(Visit visit, String question, String languageCode) {
        log.info("[AIService] Patient Q&A: visitId={} lang={}", visit.getId(), languageCode);

        String systemPrompt = promptBuilder.buildPatientChatSystemPrompt(visit, languageCode);
        String userPrompt = question;

        return claudeClient.sendMessage(systemPrompt, userPrompt);
    }

    @RateLimited(key = "ai_translate", limit = 1000, per = "DAY")
    public String translateText(String englishContent, String targetLanguageCode) {
        log.info("[AIService] Translating to language={}", targetLanguageCode);

        String systemPrompt = promptBuilder.buildTranslationSystemPrompt(targetLanguageCode);
        return claudeClient.sendMessage(systemPrompt, englishContent);
    }
}
