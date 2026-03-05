package com.shifa.domain.chat.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.chat.ChatMessage;
import com.shifa.domain.chat.ChatSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(config = GlobalMapperConfig.class)
public interface ChatMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "visit", ignore = true)
    @Mapping(target = "messages", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "startedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "lastActivityAt", expression = "java(java.time.LocalDateTime.now())")
    ChatSession toSessionEntity(ChatSessionRequest request);

    @Mapping(target = "visitId", source = "visit.id")
    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "recentMessages", ignore = true)
    ChatSessionResponse toSessionResponse(ChatSession session);

    @Mapping(target = "sessionId", source = "session.id")
    ChatMessageResponse toMessageResponse(ChatMessage message);

    List<ChatMessageResponse> toMessageResponseList(List<ChatMessage> messages);
}
