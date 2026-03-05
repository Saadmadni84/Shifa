package com.shifa.common.exception;

import org.springframework.http.HttpStatus;

public class AIProcessingException extends ShifaException {
    
    public AIProcessingException(String message) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE, "AI_PROCESSING_ERROR");
    }
    
    public AIProcessingException(String message, Throwable cause) {
        super(message, cause, HttpStatus.SERVICE_UNAVAILABLE, "AI_PROCESSING_ERROR");
    }
}
