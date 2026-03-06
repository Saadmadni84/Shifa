package com.shifa.domain.visit;

import com.shifa.common.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "visit_patient_summaries", indexes = {
    @Index(name = "idx_vps_visit", columnList = "visit_id"),
    @Index(name = "idx_vps_lang", columnList = "language_code")
})
@Getter @Setter @NoArgsConstructor
public class VisitPatientSummary extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false)
    private Visit visit;

    @Column(name = "language_code", nullable = false, length = 5)
    private String languageCode;

    @Column(name = "summary_text", nullable = false, columnDefinition = "TEXT")
    private String summaryText;

    @Column(name = "whatsapp_text", columnDefinition = "TEXT")
    private String whatsappText;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();
}
