package com.shifa.domain.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChatMessageRequest {

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String content;

}
