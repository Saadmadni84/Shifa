package com.shifa.domain.chat;

import org.springframework.data.keyvalue.repository.KeyValueRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends KeyValueRepository<ChatMessage, String> {
    @Query(value = "SELECT * FROM chat_messages WHERE session_id = :sessionId ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<ChatMessage> findLastNBySessionId(@Param("sessionId") UUID sessionId, @Param("limit") int limit);
}
