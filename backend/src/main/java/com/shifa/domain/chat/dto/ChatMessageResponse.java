package com.shifa.domain.chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {

    String id;
    String sessionId;
    String role;
    String content;
    LocalDateTime timestamp;
}
