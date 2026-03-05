package com.shifa.domain.visit;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.common.enums.Language;
import com.shifa.common.enums.VisitStatus;
import com.shifa.common.enums.WhatsAppStatus;
import com.shifa.domain.doctor.Doctor;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.prescription.Prescription;
import com.shifa.domain.vitals.VitalSigns;
import org.hibernate.annotations.JdbcTypeCode;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKey;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.doctor.Doctor;

@Entity
@Table(name = "visits", indexes = {
    @Index(name = "idx_visit_patient", columnList = "patient_id"),
    @Index(name = "idx_visit_doctor", columnList = "doctor_id"),
    @Index(name = "idx_visit_date", columnList = "visit_date"),
    @Index(name = "idx_visit_token", columnList = "patient_portal_token", unique = true),
    @Index(name = "idx_visit_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor
public class Visit extends AuditableEntity {

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
