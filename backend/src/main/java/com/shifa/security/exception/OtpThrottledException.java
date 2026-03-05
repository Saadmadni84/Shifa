package com.shifa.security.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class OtpThrottledException extends RuntimeException {
    public OtpThrottledException(String message) {
        super(message);
    }
}
