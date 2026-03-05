package com.shifa.integration.whatsapp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks/whatsapp")
public class WhatsAppWebhookController {

    @PostMapping
    public ResponseEntity<Void> receive(@RequestBody String payload) {
        return ResponseEntity.ok().build();
    }
}
