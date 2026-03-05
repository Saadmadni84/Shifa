package com.shifa.common.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends ShifaException {
    
    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT, "RESOURCE_CONFLICT");
    }
}
