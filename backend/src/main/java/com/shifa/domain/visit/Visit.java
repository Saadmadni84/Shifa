package com.shifa.domain.visit;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.doctor.Doctor;

@Entity
@Table(name = "visits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(columnDefinition = "TEXT")
    private String rawNotes;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(columnDefinition = "TEXT")
    private String vitalSigns;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String aiSummaryJson;

    private LocalDate visitDate;

    @Enumerated(EnumType.STRING)
    private VisitStatus status = VisitStatus.DRAFT;

    private String patientPortalToken;

    private LocalDateTime portalTokenExpiresAt;

    private LocalDateTime aiProcessedAt;

    private String aiErrorMessage;

    private LocalDateTime whatsappSentAt;

    private String whatsappMetaMessageId;

    private String whatsappDeliveryStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    private boolean deleted = false;

    // Legacy fields for backward compatibility
    @Deprecated
    private Long patientId;

    @Deprecated
    private Long doctorId;

    @Deprecated
    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    @Deprecated
    @Column(columnDefinition = "TEXT")
    private String structuredSummary;

    @Deprecated
    private LocalDateTime visitAt;

    @Deprecated
    private LocalDate followUpDate;

    @Deprecated
    private String statusString;
}
