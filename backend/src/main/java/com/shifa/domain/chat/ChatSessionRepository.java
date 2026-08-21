package com.shifa.domain.chat;

import org.springframework.data.keyvalue.repository.KeyValueRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends KeyValueRepository<ChatSession, String> {
    Optional<ChatSession> findByVisitId(UUID visitId);
}
