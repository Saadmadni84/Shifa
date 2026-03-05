package com.shifa.domain.notification;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.common.enums.NotificationChannel;
import com.shifa.common.enums.NotificationStatus;
import com.shifa.common.enums.NotificationType;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_patient", columnList = "patient_id"),
    @Index(name = "idx_notif_status", columnList = "status"),
    @Index(name = "idx_notif_created", columnList = "created_at")
})
@Getter @Setter @NoArgsConstructor
public class Notification extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit visit;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "recipient_phone", length = 15)
    private String recipientPhone;

    @Column(name = "external_message_id", length = 100)
    private String externalMessageId;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "retry_count")
    private int retryCount = 0;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "language_code", length = 5)
    private String languageCode;
}
