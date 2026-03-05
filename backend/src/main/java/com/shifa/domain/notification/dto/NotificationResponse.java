package com.shifa.domain.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {

    String id;
    String patientId;
    String doctorId;
    String type;
    String channel;
    String recipient;
    String status;

    LocalDateTime scheduledFor;
    LocalDateTime sentAt;
    LocalDateTime deliveredAt;
    LocalDateTime readAt;

    String errorMessage;
    Integer retryCount;

    LocalDateTime createdAt;
}
