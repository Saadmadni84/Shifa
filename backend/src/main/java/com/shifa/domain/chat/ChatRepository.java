package com.shifa.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    Optional<ChatSession> findByVisitId(UUID visitId);
}

@Repository
interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    @Query(value = "SELECT * FROM chat_messages WHERE session_id = :sessionId ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<ChatMessage> findLastNBySessionId(UUID sessionId, int limit);
}
