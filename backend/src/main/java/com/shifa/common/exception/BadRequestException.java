package com.shifa.common.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends ShifaException {
    
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }
}
