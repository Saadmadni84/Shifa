package com.shifa.service.ai;

import com.shifa.service.dto.ChatRequest;
import com.shifa.service.exception.PortalTokenExpiredException;
import com.shifa.service.exception.VisitNotFoundException;
import com.shifa.service.visit.VisitQueryService;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientChatService {

    private final VisitRepository visitRepository;
    private final AIService aiService;
    private final EscalationDetector escalationDetector;

    @Transactional(readOnly = true)
    public ChatResponse answerQuestion(String portalToken, ChatRequest request) {
        Visit visit = visitRepository.findByPatientPortalToken(portalToken)
                .orElseThrow(() -> new VisitNotFoundException("Invalid portal link"));

        if (visit.getPortalTokenExpiresAt() != null &&
                visit.getPortalTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new PortalTokenExpiredException("Your visit summary link has expired.");
        }

        String question = request.getQuestion();
        String languageCode = request.getLanguage() != null
                ? request.getLanguage()
                : visit.getPatient().getPreferredLanguage();

        log.info("[PatientChatService] Question received: visitId={} lang={}", visit.getId(), languageCode);

        EscalationDetector.EscalationResult escalation = escalationDetector.check(question, languageCode);

        if (escalation.isEmergency()) {
            log.warn("[PatientChatService] ESCALATION triggered for visitId={}", visit.getId());
            return ChatResponse.builder()
                    .answer(escalation.emergencyMessage())
                    .isEscalation(true)
                    .disclaimer(getDisclaimer(languageCode))
                    .build();
        }

        String answer = aiService.answerPatientQuestion(visit, question, languageCode);

        return ChatResponse.builder()
                .answer(answer)
                .isEscalation(false)
                .disclaimer(getDisclaimer(languageCode))
                .build();
    }

    private String getDisclaimer(String lang) {
        return switch (lang) {
            case "hi" -> "यह जानकारी आपके डॉक्टर की दी गई जानकारी पर आधारित है।";
            case "ta" -> "இந்த தகவல் உங்கள் மருத்துவரின் குறிப்புகளை அடிப்படையாகக் கொண்டது.";
            case "te" -> "ఈ సమాచారం మీ డాక్టర్ ఇచ్చిన నోట్స్ ఆధారంగా ఉంది.";
            case "bn" -> "এই তথ্য আপনার ডাক্তারের নোটের উপর ভিত্তি করে।";
            default -> "This information is based on your doctor's notes from your visit.";
        };
    }

    @lombok.Value
    @lombok.Builder
    public static class ChatResponse {
        String answer;
        boolean isEscalation;
        String disclaimer;
    }
}
