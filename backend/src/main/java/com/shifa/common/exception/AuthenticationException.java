package com.shifa.common.exception;

import org.springframework.http.HttpStatus;

public class AuthenticationException extends ShifaException {
    
    public AuthenticationException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }
}
