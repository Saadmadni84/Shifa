package com.shifa.domain.patient;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.shifa.domain.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
