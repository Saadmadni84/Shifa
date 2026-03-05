package com.shifa.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicatePatientException extends RuntimeException {
    public DuplicatePatientException(String msg) {
        super(msg);
    }
}
