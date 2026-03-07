package com.shifa.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ShifaException extends RuntimeException {
    private final HttpStatus httpStatus;
    private final String errorCode;

    public ShifaException(String message) {
        super(message);
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.errorCode = "INTERNAL_ERROR";
    }

    public ShifaException(String message, HttpStatus httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }

    public ShifaException(String message, Throwable cause, HttpStatus httpStatus, String errorCode) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }
}
