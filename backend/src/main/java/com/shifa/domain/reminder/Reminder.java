package com.shifa.domain.reminder;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.common.enums.NotificationChannel;
import com.shifa.common.enums.ReminderRecurrence;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.prescription.Medication;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders", indexes = {
    @Index(name = "idx_reminder_patient", columnList = "patient_id"),
    @Index(name = "idx_reminder_due", columnList = "next_trigger_at"),
    @Index(name = "idx_reminder_active", columnList = "active")
})
@Getter @Setter @NoArgsConstructor
public class Reminder extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id")
    private Medication medication;

    @Column(name = "reminder_text", nullable = false, columnDefinition = "TEXT")
    private String reminderText;

    @Column(name = "next_trigger_at", nullable = false)
    private LocalDateTime nextTriggerAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence", nullable = false)
    private ReminderRecurrence recurrence;

    @Column(name = "recurrence_times", columnDefinition = "TEXT")
    private String recurrenceTimes;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private NotificationChannel channel = NotificationChannel.WHATSAPP;

    @Column(name = "times_sent")
    private int timesSent = 0;

    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt;
}
