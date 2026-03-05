package com.shifa.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ShifaException extends RuntimeException {
    public ShifaException(String message) {
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
