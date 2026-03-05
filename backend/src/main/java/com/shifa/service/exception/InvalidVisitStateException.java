package com.shifa.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidVisitStateException extends RuntimeException {
    public InvalidVisitStateException(String msg) {
        super(msg);
    }
}
