package com.shifa.domain.visit;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.common.enums.Language;
import com.shifa.common.enums.VisitStatus;
import com.shifa.common.enums.WhatsAppStatus;
import com.shifa.domain.doctor.Doctor;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.prescription.Prescription;
import com.shifa.domain.vitals.VitalSigns;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
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
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "visit_type", length = 50)
    private String visitType;

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "raw_notes", columnDefinition = "TEXT")
    private String rawNotes;

    @Type(JsonBinaryType.class)
    @Column(name = "ai_summary", columnDefinition = "jsonb")
    private VisitSummaryData aiSummary;

    @OneToMany(mappedBy = "visit", cascade = CascadeType.ALL, orphanRemoval = true)
    @MapKey(name = "languageCode")
    private Map<String, VisitPatientSummary> patientSummaries = new HashMap<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VisitStatus status = VisitStatus.DRAFT;

    @Column(name = "ai_processed_at")
    private LocalDateTime aiProcessedAt;

    @Column(name = "sent_to_patient_at")
    private LocalDateTime sentToPatientAt;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_notes", columnDefinition = "TEXT")
    private String followUpNotes;

    @OneToOne(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Prescription prescription;

    @OneToOne(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private VitalSigns vitalSigns;

    @Column(name = "whatsapp_message_id", length = 100)
    private String whatsappMessageId;

    @Enumerated(EnumType.STRING)
    @Column(name = "whatsapp_status")
    private WhatsAppStatus whatsappStatus = WhatsAppStatus.NOT_SENT;

    @Column(name = "whatsapp_sent_at")
    private LocalDateTime whatsappSentAt;

    @Column(name = "patient_portal_token", unique = true)
    private String patientPortalToken;

    @Column(name = "portal_token_expires_at")
    private LocalDateTime portalTokenExpiresAt;

    public boolean isPortalAccessValid() {
        return patientPortalToken != null &&
            portalTokenExpiresAt != null &&
            portalTokenExpiresAt.isAfter(LocalDateTime.now());
    }

    public String getPatientSummaryText(Language lang) {
        VisitPatientSummary summary = patientSummaries.get(lang.name().toLowerCase());
        if (summary == null) {
            summary = patientSummaries.get("en");
        }
        return summary != null ? summary.getSummaryText() : null;
    }
}
