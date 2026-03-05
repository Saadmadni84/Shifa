package com.shifa.domain.prescription;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.domain.visit.Visit;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Getter @Setter @NoArgsConstructor
public class Prescription extends AuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false, unique = true)
    private Visit visit;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<Medication> medications = new ArrayList<>();

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "diet_advice", columnDefinition = "TEXT")
    private String dietAdvice;

    @Column(name = "activity_restrictions", columnDefinition = "TEXT")
    private String activityRestrictions;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "document_ocr_text", columnDefinition = "TEXT")
    private String documentOcrText;

    @Column(name = "validity_days")
    private Integer validityDays = 30;

    @Column(name = "is_repeat_prescription")
    private boolean repeatPrescription = false;
}
