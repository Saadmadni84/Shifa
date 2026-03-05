package com.shifa.integration.ai.streaming;

import com.shifa.common.enums.Language;
import com.shifa.domain.visit.Visit;
import com.shifa.integration.ai.AIPromptService;
import com.shifa.integration.ai.dto.ClaudeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.scheduler.Schedulers;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SseEmitterService {

    private final AIPromptService aiPromptService;

    public SseEmitter streamChatResponse(Visit visit, List<ClaudeRequest.Message> history,
                                          String question, Language language) {
        SseEmitter emitter = new SseEmitter(45_000L); // 45s timeout

        aiPromptService.streamPatientAnswer(visit, history, question, language)
            .doOnNext(token -> {
                try {
                    emitter.send(SseEmitter.event().name("token")
                        .data("{\"text\":\"" + escapeJson(token) + "\"}"));
                } catch (Exception e) { emitter.completeWithError(e); }
            })
            .doOnComplete(() -> {
                try {
                    emitter.send(SseEmitter.event().name("done").data("{}"));
                    emitter.complete();
                } catch (Exception e) { emitter.completeWithError(e); }
            })
            .doOnError(e -> {
                log.error("[SSE] Stream error visitId={}", visit.getId(), e);
                emitter.completeWithError(e);
            })
            .subscribeOn(Schedulers.boundedElastic())
            .subscribe();

        return emitter;
    }

    private String escapeJson(String t) {
        return t.replace("\\","\\\\").replace("\"","\\\"")
                .replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");
    }
}
