package com.shifa.domain.chat;

import com.shifa.domain.chat.dto.ChatRequest;
import com.shifa.domain.chat.dto.ChatResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/{visitToken}")
    public ResponseEntity<ChatResponse> askQuestion(
        @PathVariable String visitToken,
        @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.askQuestion(visitToken, request));
    }
}
