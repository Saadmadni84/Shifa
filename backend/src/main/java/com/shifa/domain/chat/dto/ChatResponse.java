package com.shifa.domain.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class ChatResponse {
    private String answer;
    private UUID messageId;
    private UUID sessionId;
}
