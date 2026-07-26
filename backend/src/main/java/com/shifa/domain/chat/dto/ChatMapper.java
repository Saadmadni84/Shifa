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
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleteReason", ignore = true)
    @Mapping(target = "visit", ignore = true)
    @Mapping(target = "patientLanguage", ignore = true)
    @Mapping(target = "messages", ignore = true)
    @Mapping(target = "totalMessages", constant = "0")
    @Mapping(target = "lastMessageAt", expression = "java(java.time.LocalDateTime.now())")
    ChatSession toSessionEntity(ChatSessionRequest request);

    @Mapping(target = "visitId", source = "visit.id")
    @Mapping(target = "patientId", source = "visit.patient.id")
    @Mapping(target = "title", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "startedAt", source = "createdAt")
    @Mapping(target = "lastActivityAt", source = "lastMessageAt")
    @Mapping(target = "recentMessages", ignore = true)
    ChatSessionResponse toSessionResponse(ChatSession session);

    @Mapping(target = "sessionId", source = "session.id")
    @Mapping(target = "timestamp", source = "createdAt")
    ChatMessageResponse toMessageResponse(ChatMessage message);

    List<ChatMessageResponse> toMessageResponseList(List<ChatMessage> messages);
}
