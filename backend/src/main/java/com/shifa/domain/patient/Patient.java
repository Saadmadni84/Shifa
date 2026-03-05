package com.shifa.domain.patient;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.common.enums.Gender;
import com.shifa.common.enums.Language;
import com.shifa.domain.doctor.Doctor;
import com.shifa.domain.user.User;
import com.shifa.domain.visit.Visit;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.shifa.domain.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String firstName;
    private String lastName;

    private String name; // Legacy field

    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        return name;
    }

    private Integer age;

    private String abhaId;

    @Column(unique = true)
    private String phoneNumber; // For WhatsApp

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender; // M, F, O

    private String preferredLanguage; // en, hi, ta, etc.

    private String address;

    private String knownConditions;

    private String allergies;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean deleted = false;

    private LocalDateTime deletedAt;

    private String deleteReason;

    // Computed methods
    public String getKnownConditionsText() {
        return knownConditions != null ? knownConditions : "";
    }

    public String getCurrentMedicinesText() {
        // TODO: implement based on prescriptions
        return "";
    }
}
