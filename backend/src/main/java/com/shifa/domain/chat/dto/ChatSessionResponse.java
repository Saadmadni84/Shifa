package com.shifa.domain.chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatSessionResponse {

    String id;
    String visitId;
    String patientId;
    String title;
    boolean active;
    LocalDateTime startedAt;
    LocalDateTime lastActivityAt;

    List<ChatMessageResponse> recentMessages;
}
