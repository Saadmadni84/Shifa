package com.shifa.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GONE)
public class PortalTokenExpiredException extends RuntimeException {
    public PortalTokenExpiredException(String msg) {
        super(msg);
    }
}
