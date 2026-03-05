package com.shifa.integration.whatsapp;

import com.shifa.common.enums.Language;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@Slf4j
@RequiredArgsConstructor
public class WhatsAppService {

    private final WhatsAppClient client;
    private final WhatsAppMessageFormatter formatter;

    public void sendVisitSummary(String to, String summaryText, String portalToken, Language lang, String patientFirstName) {
        String message = formatter.buildVisitSummaryMessage(summaryText, portalToken, lang, patientFirstName);
        client.sendTextMessage(to, message);
    }

    public void sendOtp(String to, String otp, Language lang) {
        String message = formatter.buildOtpMessage(otp, lang);
        client.sendTextMessage(to, message);
    }

    public void sendMedicationReminder(String to, String medName, String timing, String dosage, Language lang) {
        String message = formatter.buildMedicationReminder(medName, timing, dosage, lang);
        client.sendTextMessage(to, message);
    }
    
    // Abstract method implementations for sending template message as an example
    public void sendWelcomeTemplate(String to, String templateName, String langCode) {
        client.sendTemplateMessage(to, templateName, langCode, java.util.List.of());
    }
}
