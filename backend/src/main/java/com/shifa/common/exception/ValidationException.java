package com.shifa.common.exception;

import org.springframework.http.HttpStatus;

public class ValidationException extends ShifaException {
    
    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_FAILED");
    }
}
