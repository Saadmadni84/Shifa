package com.shifa.integration.whatsapp;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final WhatsAppClient whatsAppClient;

    public void sendVisitSummary(String phoneNumber, String message) {
        whatsAppClient.sendMessage(phoneNumber, message);
    }
}
