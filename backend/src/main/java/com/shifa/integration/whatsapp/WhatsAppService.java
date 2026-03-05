package com.shifa.integration.whatsapp;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.shifa.domain.notification.Notification;
import com.shifa.domain.visit.Visit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);

    private final WhatsAppClient whatsAppClient;

    public void sendVisitSummary(String phoneNumber, String message) {
        whatsAppClient.sendMessage(phoneNumber, message);
    }

    public String sendVisitSummary(com.shifa.domain.visit.Visit visit) {
        String phoneNumber = visit.getPatient().getPhoneNumber();
        String message = "Visit summary placeholder"; // TODO: generate actual summary
        whatsAppClient.sendMessage(phoneNumber, message);
        return "mock_message_id"; // TODO: return actual message ID
    }

    private String redactPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() <= 4) {
            return "****";
        }
        int visibleDigits = 4;
        String suffix = phoneNumber.substring(phoneNumber.length() - visibleDigits);
        return "****" + suffix;
    }

    public void sendOTP(String phoneNumber, String otp) {
        String redactedPhone = redactPhoneNumber(phoneNumber);
        log.info("Sending WhatsApp OTP to {}", redactedPhone);
    }

    public void sendReminder(Notification notification) {
        // Implementation for sending reminder text/template
        whatsAppClient.sendMessage("patient_placeholder_number", notification.getMessage());
    }

    public void sendTemplateMessage(String phoneNumber, String templateName, List<String> placeholders) {
        // Implementation for sending template message
        whatsAppClient.sendMessage(phoneNumber, "Template: " + templateName + " " + placeholders.toString());
    }
}
