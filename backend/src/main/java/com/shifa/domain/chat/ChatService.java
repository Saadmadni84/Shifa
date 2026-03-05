package com.shifa.domain.chat;

import com.shifa.domain.chat.dto.ChatRequest;
import com.shifa.domain.chat.dto.ChatResponse;
import com.shifa.domain.visit.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final VisitRepository visitRepository;

    public ChatResponse askQuestion(String visitToken, ChatRequest request) {
        return null; // TODO implement
    }
}
