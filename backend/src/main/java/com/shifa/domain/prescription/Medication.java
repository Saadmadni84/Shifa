package com.shifa.domain.prescription;

import com.shifa.common.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "prescription_medications")
@Getter @Setter @NoArgsConstructor
public class Medication extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "generic_name", length = 200)
    private String genericName;

    @Column(name = "dosage", length = 100)
    private String dosage;

    @Column(name = "frequency", length = 100)
    private String frequency;

    @Column(name = "timing", length = 200)
    private String timing;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "route", length = 50)
    private String route;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "purpose", length = 300)
    private String purpose;

    @Column(name = "side_effects", columnDefinition = "TEXT")
    private String sideEffectsToWatch;

    @Column(name = "needs_refrigeration")
    private boolean needsRefrigeration = false;

    @Column(name = "is_critical")
    private boolean critical = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    public String getScheduleText() {
        return "%s — %s %s (%s)".formatted(name, frequency, timing,
            durationDays != null ? "for " + durationDays + " days" : "as needed");
    }
}
