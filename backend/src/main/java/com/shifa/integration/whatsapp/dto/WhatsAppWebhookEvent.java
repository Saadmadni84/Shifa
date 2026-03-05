package com.shifa.integration.whatsapp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WhatsAppWebhookEvent {
    private String object;
    private List<Entry> entry;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Entry {
        private String id;
        private List<Change> changes;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Change {
        private Value value;
        private String field;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Value {
        @JsonProperty("messaging_product")
        private String messagingProduct;
        private Metadata metadata;
        private List<MessageStatus> statuses;
        private List<IncomingMessage> messages;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        @JsonProperty("display_phone_number")
        private String displayPhoneNumber;
        @JsonProperty("phone_number_id")
        private String phoneNumberId;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MessageStatus {
        private String id;
        private String status;
        private String timestamp;
        @JsonProperty("recipient_id")
        private String recipientId;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class IncomingMessage {
        private String from;
        private String id;
        private String timestamp;
        private String type;
        private Text text;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Text {
        private String body;
    }
}
