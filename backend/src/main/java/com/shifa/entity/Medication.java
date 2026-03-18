package com.shifa.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "MedicationCatalog")
@Table(name = "medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "rxnorm_code", nullable = false, unique = true)
    private String rxnormCode;

    @Column(name = "atc_code")
    private String atcCode;

    @Column(name = "ndc_code")
    private String ndcCode;

    @Column(name = "generic_name", nullable = false)
    private String genericName;

    @Column(name = "brand_names", columnDefinition = "jsonb")
    private String brandNames;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "form", nullable = false)
    private String form;

    @Column(name = "strength_value", precision = 10, scale = 4, nullable = false)
    private BigDecimal strengthValue;

    @Column(name = "strength_unit", nullable = false)
    private String strengthUnit;

    @Column(name = "ingredients", columnDefinition = "jsonb")
    private String ingredients;

    @Builder.Default
    @Column(name = "black_box_warning", nullable = false)
    private Boolean blackBoxWarning = false;

    @Column(name = "pregnancy_category")
    private String pregnancyCategory;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "source_last_updated")
    private LocalDateTime sourceLastUpdated;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
// trigger rebuild
