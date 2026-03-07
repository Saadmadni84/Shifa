package com.shifa.scheduler.dto;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class ReminderResult {

    String notificationId;
    String patientId;
    String type;
    String channel;
    boolean success;
    String errorMessage;
    long durationMs;

    public static ReminderResult ok(String notifId, String patientId, String type, String channel, long ms) {
        return ReminderResult.builder()
                .notificationId(notifId)
                .patientId(patientId)
                .type(type)
                .channel(channel)
                .success(true)
                .durationMs(ms)
                .build();
    }

    public static ReminderResult fail(String notifId, String patientId, String type, String channel, String error) {
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

    public static ReminderResult ok(UUID notifId, UUID patientId, String type, String channel, long ms) {
        return ok(
            notifId != null ? notifId.toString() : null,
            patientId != null ? patientId.toString() : null,
            type,
            channel,
            ms);
    }

    public static ReminderResult fail(UUID notifId, UUID patientId, String type, String channel, String error) {
        return fail(
            notifId != null ? notifId.toString() : null,
            patientId != null ? patientId.toString() : null,
            type,
            channel,
            error);
    }
}
