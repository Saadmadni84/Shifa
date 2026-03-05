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
    @Mapping(target = "patientLanguage", ignore = true)
    @Mapping(target = "totalMessages", constant = "0")
    @Mapping(target = "lastMessageAt", expression = "java(java.time.LocalDateTime.now())")
    ChatSession toSessionEntity(ChatSessionRequest request);

    @Mapping(target = "visitId", source = "visit.id")
    @Mapping(target = "patientId", source = "visit.patient.id")
    @Mapping(target = "recentMessages", ignore = true)
    ChatSessionResponse toSessionResponse(ChatSession session);

    @Mapping(target = "sessionId", source = "session.id")
    ChatMessageResponse toMessageResponse(ChatMessage message);

    List<ChatMessageResponse> toMessageResponseList(List<ChatMessage> messages);
}
