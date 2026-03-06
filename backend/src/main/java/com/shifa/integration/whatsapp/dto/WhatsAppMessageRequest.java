package com.shifa.integration.whatsapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WhatsAppMessageRequest {
    private String messagingProduct;
    private String recipientType;
    private String to;
    private String type;
    private Template template;
    private Text text;

    @Data
    @Builder
    public static class Template {
        private String name;
        private Language language;
        // Optional components for variables
        private Object components;
    }

    @Data
    @Builder
    public static class Language {
        private String code;
    }

    @Data
    @Builder
    public static class Text {
        private boolean previewUrl;
        private String body;
    }
}
