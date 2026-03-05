package com.shifa.integration.ai.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ClaudeRequest {

    private String model;
    private int maxTokens;
    private double temperature;
    private String system;
    private List<Message> messages;

    @Data
    @Builder
    public static class Message {
        private String role;
        private String content;
    }
}
