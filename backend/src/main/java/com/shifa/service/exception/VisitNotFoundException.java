package com.shifa.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class VisitNotFoundException extends RuntimeException {
    public VisitNotFoundException(UUID id) {
        super("Visit not found: " + id);
    }

    public VisitNotFoundException(String msg) {
        super(msg);
    }
}
