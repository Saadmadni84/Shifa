package com.shifa.integration.whatsapp.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class WhatsAppMessageResponse {

    private String messagingProduct;
    private List<Contact> contacts;
    private List<Message> messages;
    private Error error;

    @Data
    @NoArgsConstructor
    public static class Contact {
        private String input;
        private String waId;
    }

    @Data
    @NoArgsConstructor
    public static class Message {
        private String id;
        private String messageStatus;
    }

    @Data
    @NoArgsConstructor
    public static class Error {
        private String message;
        private String type;
        private int code;
        private String fbtraceId;
    }

    public boolean isSuccess() {
        return error == null && messages != null && !messages.isEmpty();
    }

    public String getMessageId() {
        if (isSuccess()) {
            return messages.get(0).getId();
        }
        return null;
    }
}
