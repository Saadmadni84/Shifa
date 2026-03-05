package com.shifa.integration.email;

import com.shifa.common.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final SesEmailClient sesClient;
    private final EmailTemplateBuilder templateBuilder;

    @Async("notificationTaskExecutor")
    public void sendWelcomeEmail(String toEmail, String name, UserRole role) {
        sesClient.sendHtml(toEmail, "Welcome to Shifa 💚",
            templateBuilder.buildWelcomeEmail(name, role));
        log.info("[Email] Welcome sent to {}", toEmail);
    }

    @Async("notificationTaskExecutor")
    public void sendPasswordResetEmail(String toEmail, String name, String resetLink) {
        sesClient.sendHtml(toEmail, "Reset your Shifa password",
            templateBuilder.buildPasswordResetEmail(name, resetLink));
    }

    @Async("notificationTaskExecutor")
    public void sendVisitSummaryEmail(String toEmail, String patientName,
                                       String visitDate, String portalUrl) {
        sesClient.sendHtml(toEmail, "Your visit summary is ready — Shifa",
            templateBuilder.buildVisitSummaryEmail(patientName, visitDate, portalUrl));
    }
}
