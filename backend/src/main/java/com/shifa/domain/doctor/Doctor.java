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
import lombok.AllArgsConstructor;
import com.shifa.domain.user.User;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String firstName;
    private String lastName;

    public String getFullName() {
        if (firstName != null && lastName != null)
            return firstName + " " + lastName;
        return name;
    }

    private String name;

    @Column(unique = true)
    private String email;

    @Column(name = "registration_number", unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "specialization", length = 100)
    private String specialization;

    private String licenseNumber;
    private String registrationNumber;

    private String clinicName;
    private String clinicAddress;

    private String phoneNumber; // For WhatsApp

    @Column(name = "digest_enabled")
    private boolean digestEnabled = true;
}
