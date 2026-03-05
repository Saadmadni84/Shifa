package com.shifa.integration.sms;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class DltTemplateRegistry {

    public static final Map<String, String> TEMPLATE_IDS = Map.of(
        "OTP",           "1307163452123456789",
        "MEDICATION",    "1307163452234567890",
        "FOLLOW_UP",     "1307163452345678901",
        "VISIT_SUMMARY", "1307163452456789012",
        "WELCOME",       "1307163452567890123"
    );

    public String getTemplateId(String type) {
        return TEMPLATE_IDS.getOrDefault(type, "");
    }
}
