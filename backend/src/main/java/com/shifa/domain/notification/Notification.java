package com.shifa.domain.notification;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit visit;

    private String title;

    private String channel;
    private String status;

    @Column(columnDefinition = "TEXT")
    private String message;

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
