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
        String messageId = whatsAppClient.sendMessage(phoneNumber, message);
        return messageId;
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
        if (notification == null || notification.getPatient() == null) {
            log.warn("Cannot send reminder: notification or patient is null. Notification: {}", notification);
            return;
        }

        String phoneNumber = notification.getPatient().getPhoneNumber();
        String message = notification.getMessage();

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            log.warn("Cannot send reminder: patient phone number is missing for notification: {}", notification);
            return;
        }

        whatsAppClient.sendMessage(phoneNumber, message);
    }

    public void sendTemplateMessage(String phoneNumber, String templateName, List<String> placeholders) {
        // Implementation for sending template message
        whatsAppClient.sendMessage(phoneNumber, "Template: " + templateName + " " + placeholders.toString());
    }
}
