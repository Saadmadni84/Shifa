package com.shifa.integration.whatsapp.exception;

public class WhatsAppRateLimitException extends WhatsAppException {
    public WhatsAppRateLimitException(String message) {
        super(message);
    }
}
