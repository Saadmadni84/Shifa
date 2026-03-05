package com.shifa.service.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String question;
    private String language;
}
