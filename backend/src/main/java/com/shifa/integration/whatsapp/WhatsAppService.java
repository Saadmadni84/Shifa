package com.shifa.integration.whatsapp;

import com.shifa.common.enums.Language;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.shifa.domain.notification.Notification;
import com.shifa.domain.visit.Visit;
import java.util.List;

import java.time.LocalDate;

@Service
@Slf4j
@RequiredArgsConstructor
public class WhatsAppService {

    private final WhatsAppClient whatsAppClient;

    public void sendMedicationReminder(String to, String medName, String timing, String dosage, Language lang) {
        String message = "Take " + medName + " " + dosage + " " + timing;
        whatsAppClient.sendTextMessage(to, message);
    }
    
    // Abstract method implementations for sending template message as an example
    public void sendWelcomeTemplate(String to, String templateName, String langCode) {
        whatsAppClient.sendTemplateMessage(to, templateName, langCode, java.util.List.of());
    }

    public String sendVisitSummary(com.shifa.domain.visit.Visit visit) {
        String phoneNumber = visit.getPatient().getPhoneNumber();
        String message = "Visit summary placeholder"; // TODO: generate actual summary
        String messageId = whatsAppClient.sendTextMessage(phoneNumber, message);
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

    public void sendOtp(String phoneNumber, String otp, Language lang) {
        String body = switch (lang != null ? lang.getCode() : "en") {
            case "hi" -> "Aapka OTP hai: " + otp;
            default -> "Your OTP is: " + otp;
        };
        whatsAppClient.sendTextMessage(phoneNumber, body);
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

        whatsAppClient.sendTextMessage(phoneNumber, message);
    }

    public void sendTemplateMessage(String phoneNumber, String templateName, List<String> placeholders) {
        whatsAppClient.sendTemplateMessage(phoneNumber, templateName, "en", placeholders);
    }
}
