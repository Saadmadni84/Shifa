package com.shifa.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medication_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationInteraction {

    @Id
    private UUID id;

    @Column(name = "drug_a_id", nullable = false)
    private UUID drugAId;

    @Column(name = "drug_b_id", nullable = false)
    private UUID drugBId;

    @Column(nullable = false)
    private String severity;

    @Column(columnDefinition = "text", nullable = false)
    private String description;

    @Column(columnDefinition = "text", nullable = false)
    private String management;

    @Column(name = "source_database", nullable = false)
    private String sourceDatabase;

    @Builder.Default
    @Column(name = "should_alert", nullable = false)
    private Boolean shouldAlert = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
