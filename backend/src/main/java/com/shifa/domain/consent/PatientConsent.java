package com.shifa.domain.consent;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.common.enums.ConsentType;
import com.shifa.domain.patient.Patient;
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
@Table(name = "patient_consents", indexes = {
    @Index(name = "idx_consent_patient", columnList = "patient_id"),
    @Index(name = "idx_consent_type", columnList = "consent_type")
})
@Getter @Setter @NoArgsConstructor
public class PatientConsent extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false)
    private ConsentType consentType;

    @Column(name = "granted", nullable = false)
    private boolean granted;

    @Column(name = "granted_at")
    private LocalDateTime grantedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "consent_text_shown", columnDefinition = "TEXT")
    private String consentTextShown;

    @Column(name = "version", length = 20)
    private String version;

    @Column(name = "purpose", columnDefinition = "TEXT")
    private String purpose;
}
