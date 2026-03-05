package com.shifa.domain.doctor;

import jakarta.persistence.*;
import lombok.Data;
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

    private String specialization;

    private String licenseNumber;
    private String registrationNumber;

    private String clinicName;
    private String clinicAddress;

    private String phoneNumber; // For WhatsApp

    @Column(name = "digest_enabled")
    private boolean digestEnabled = true;
}
