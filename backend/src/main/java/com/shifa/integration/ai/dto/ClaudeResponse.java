package com.shifa.integration.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class ClaudeResponse {

    private String id;
    private String type;
    private String role;
    private List<Content> content;
    private String model;
    private Usage usage;

    @Data
    @NoArgsConstructor
    public static class Content {
        private String type;
        private String text;
    }

    @Data
    @NoArgsConstructor
    public static class Usage {
        private int inputTokens;
        private int outputTokens;
    }

    public String getText() {
        if (content != null && !content.isEmpty()) {
            return content.get(0).getText();
        }
        return "";
    }
}
