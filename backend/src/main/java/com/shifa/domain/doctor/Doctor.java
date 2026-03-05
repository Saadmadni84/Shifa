package com.shifa.domain.doctor;

import com.shifa.common.audit.AuditableEntity;
import com.shifa.common.enums.Language;
import com.shifa.domain.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors", indexes = {
    @Index(name = "idx_doctor_reg", columnList = "registration_number", unique = true),
    @Index(name = "idx_doctor_user", columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor
public class Doctor extends AuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "registration_number", unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "specialization", length = 100)
    private String specialization;

    @Column(name = "qualification", length = 200)
    private String qualification;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Embedded
    private Clinic clinic;

    @ElementCollection
    @CollectionTable(name = "doctor_languages",
        joinColumns = @JoinColumn(name = "doctor_id"))
    @Enumerated(EnumType.STRING)
    private List<Language> spokenLanguages = new ArrayList<>();

    @Column(name = "consultation_fee")
    private BigDecimal consultationFee;

    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    @Column(name = "total_patients")
    private int totalPatients = 0;

    @Column(name = "total_visits")
    private int totalVisits = 0;
}
