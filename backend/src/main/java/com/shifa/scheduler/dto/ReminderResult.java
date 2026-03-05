package com.shifa.scheduler.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ReminderResult {

    Long notificationId;
    Long patientId;
    String type;
    String channel;
    boolean success;
    String errorMessage;
    long durationMs;

    public static ReminderResult ok(Long notifId, Long patientId, String type, String channel, long ms) {
        return ReminderResult.builder()
                .notificationId(notifId)
                .patientId(patientId)
                .type(type)
                .channel(channel)
                .success(true)
                .durationMs(ms)
                .build();
    }

    public static ReminderResult fail(Long notifId, Long patientId, String type, String channel, String error) {
        return ReminderResult.builder()
                .notificationId(notifId)
                .patientId(patientId)
                .type(type)
                .channel(channel)
                .success(false)
                .errorMessage(error)
                .durationMs(0)
                .build();
    }
}
