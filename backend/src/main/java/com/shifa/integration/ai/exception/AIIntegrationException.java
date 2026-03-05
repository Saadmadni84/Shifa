package com.shifa.integration.ai.exception;

public class AIIntegrationException extends RuntimeException {
    public AIIntegrationException(String message) {
        super(message);
    }
    public AIIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
