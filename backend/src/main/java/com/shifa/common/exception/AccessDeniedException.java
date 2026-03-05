package com.shifa.common.exception;

import org.springframework.http.HttpStatus;

public class AccessDeniedException extends ShifaException {
    
    public AccessDeniedException(String message) {
        super(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    }
}
