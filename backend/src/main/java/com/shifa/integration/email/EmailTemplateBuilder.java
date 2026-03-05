package com.shifa.integration.email;

import com.shifa.domain.user.UserRole;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplateBuilder {

    public String buildWelcomeEmail(String name, UserRole role) {
        return "<html><body><h2>Welcome " + name + " to Shifa!</h2><p>Your role is " + role.name() + ".</p></body></html>";
    }

    public String buildPasswordResetEmail(String name, String resetLink) {
        return "<html><body><h2>Password Reset</h2><p>Hi " + name + ", <a href='" + resetLink + "'>click here</a> to reset your password.</p></body></html>";
    }

    public String buildVisitSummaryEmail(String patientName, String visitDate, String portalUrl) {
        return "<html><body><h2>Your Visit Summary is Ready</h2><p>Hi " + patientName + ", your visit summary for " + visitDate + " is ready. <a href='" + portalUrl + "'>View here</a>.</p></body></html>";
    }
}
