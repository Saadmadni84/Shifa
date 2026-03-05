package com.shifa.integration.fcm.exception;

public class PushNotificationException extends RuntimeException {
    public PushNotificationException(String message) {
        super(message);
    }
    public PushNotificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
