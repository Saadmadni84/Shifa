package com.shifa.domain.notification;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private String channel;
    private String status;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime sentAt;

    private String type; // MEDICINE_REMINDER | FOLLOW_UP | TEST_REMINDER

    private LocalDateTime scheduledFor;

    @Column(name = "meta_message_id")
    private String metaMessageId;

    @Column(name = "delivery_status")
    private String deliveryStatus;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "retry_count")
    private int retryCount = 0;
}
