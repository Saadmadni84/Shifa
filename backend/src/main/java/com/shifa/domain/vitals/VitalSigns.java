package com.shifa.domain.vitals;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.domain.visit.Visit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vital_signs")
@Getter @Setter @NoArgsConstructor
public class VitalSigns extends AuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false, unique = true)
    private Visit visit;

    @Column(name = "bp_systolic")
    private Integer bpSystolic;

    @Column(name = "bp_diastolic")
    private Integer bpDiastolic;

    @Column(name = "pulse_rate")
    private Integer pulseRate;

    @Column(name = "temperature")
    private BigDecimal temperature;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "spo2")
    private Integer spo2;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "bmi")
    private BigDecimal bmi;

    @Column(name = "blood_sugar_fasting")
    private BigDecimal bloodSugarFasting;

    @Column(name = "blood_sugar_random")
    private BigDecimal bloodSugarRandom;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist @PreUpdate
    public void calculateBmi() {
        if (weightKg != null && heightCm != null && heightCm.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal heightM = heightCm.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            this.bmi = weightKg.divide(heightM.multiply(heightM), 1, RoundingMode.HALF_UP);
        }
    }

    public List<String> getAbnormalFindings() {
        List<String> findings = new ArrayList<>();
        if (bpSystolic != null && (bpSystolic > 140 || bpSystolic < 90))
            findings.add("Blood pressure: " + bpSystolic + "/" + bpDiastolic + " mmHg");
        if (temperature != null && temperature.compareTo(new BigDecimal("37.5")) > 0)
            findings.add("Fever: " + temperature + "°C");
        if (spo2 != null && spo2 < 95)
            findings.add("Low SpO2: " + spo2 + "%");
        if (pulseRate != null && (pulseRate > 100 || pulseRate < 60))
            findings.add("Abnormal pulse: " + pulseRate + " bpm");
        return findings;
    }
}
