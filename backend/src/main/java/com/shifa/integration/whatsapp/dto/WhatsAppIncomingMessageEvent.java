package com.shifa.integration.whatsapp.dto;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class WhatsAppIncomingMessageEvent extends ApplicationEvent {
    private final String from;
    private final String type;
    private final String body;

    public WhatsAppIncomingMessageEvent(Object source, String from, String type, String body) {
        super(source);
        this.from = from;
        this.type = type;
        this.body = body;
    }
}
