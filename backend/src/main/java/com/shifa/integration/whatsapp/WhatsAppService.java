package com.shifa.integration.whatsapp;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.shifa.domain.notification.Notification;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final WhatsAppClient whatsAppClient;

    public void sendVisitSummary(String phoneNumber, String message) {
        whatsAppClient.sendMessage(phoneNumber, message);
    }

    public void sendOTP(String phoneNumber, String otp) {
        log.info("Sending WhatsApp OTP to {}: {}", phoneNumber, otp);
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
