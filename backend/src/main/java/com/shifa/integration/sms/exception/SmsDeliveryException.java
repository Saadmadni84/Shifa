package com.shifa.integration.sms.exception;

public class SmsDeliveryException extends RuntimeException {
    public SmsDeliveryException(String message) {
        super(message);
    }
    public SmsDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
