package com.shifa.domain.patient;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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
import lombok.Setter;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_phone", columnList = "phone_number", unique = true),
    @Index(name = "idx_patient_abha", columnList = "abha_id"),
    @Index(name = "idx_patient_name", columnList = "first_name, last_name")
})
@Getter @Setter @NoArgsConstructor
public class Patient extends AuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "phone_number", unique = true, nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "abha_id", unique = true, length = 17)
    private String abhaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_language", nullable = false)
    private Language preferredLanguage = Language.HI;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "is_demo", columnDefinition = "boolean default false")
    private Boolean isDemo = false;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "known_conditions", columnDefinition = "TEXT")
    private String knownConditions;

    @Column(name = "current_medicines_text", columnDefinition = "TEXT")
    private String currentMedicinesText;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "patient_allergies",
        joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "allergy")
    private List<String> allergies = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "patient_chronic_conditions",
        joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "condition_name")
    private List<String> chronicConditions = new ArrayList<>();

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 15)
    private String emergencyContactPhone;

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @OrderBy("visitDate DESC")
    private List<Visit> visits = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "patient_doctors",
        joinColumns = @JoinColumn(name = "patient_id"),
        inverseJoinColumns = @JoinColumn(name = "doctor_id"))
    private List<Doctor> doctors = new ArrayList<>();

    public Integer getAge() {
        return dateOfBirth != null
            ? (int) ChronoUnit.YEARS.between(dateOfBirth, LocalDate.now())
            : 0;
    }

    public void setAge(Integer age) {
        if (age == null) {
            this.dateOfBirth = null;
            return;
        }
        this.dateOfBirth = LocalDate.now().minusYears(age);
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getName() {
        return getFullName();
    }

    public String getKnownConditionsText() {
        if (knownConditions != null && !knownConditions.isBlank()) {
            return knownConditions;
        }
        return chronicConditions == null || chronicConditions.isEmpty()
            ? "None"
            : String.join(", ", chronicConditions);
    }

    public String getCurrentMedicinesText() {
        return (currentMedicinesText == null || currentMedicinesText.isBlank())
            ? "Not specified"
            : currentMedicinesText;
    }

    public void setAllergiesText(String allergiesText) {
        if (allergiesText == null || allergiesText.isBlank()) {
            this.allergies = new ArrayList<>();
            return;
        }
        this.allergies = Arrays.stream(allergiesText.split(","))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .collect(Collectors.toList());
    }

    public String getAllergiesText() {
        return allergies == null || allergies.isEmpty() ? "" : String.join(",", allergies);
    }

    public void setKnownConditions(String knownConditionsText) {
        this.knownConditions = knownConditionsText;
        if (knownConditionsText == null || knownConditionsText.isBlank()) {
            this.chronicConditions = new ArrayList<>();
            return;
        }
        this.chronicConditions = Arrays.stream(knownConditionsText.split(","))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .collect(Collectors.toList());
    }

    public void setPreferredLanguage(String languageCode) {
        this.preferredLanguage = languageCode == null
            ? Language.HI
            : Language.fromCode(languageCode);
    }
}
