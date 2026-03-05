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
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;

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
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit visit;

    private String title;

    private String channel;
    private String status;

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

    private LocalDateTime createdAt;

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

    // Legacy field
    @Deprecated
    private Long patientId;
}
