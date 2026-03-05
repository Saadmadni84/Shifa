package com.shifa.integration.ocr.exception;

public class OcrException extends RuntimeException {
    public OcrException(String message) {
        super(message);
    }
    public OcrException(String message, Throwable cause) {
        super(message, cause);
    }
}
