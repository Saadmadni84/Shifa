package com.shifa.domain.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phoneNumber;

    private String passwordHash;

    private String role; // "DOCTOR", "PATIENT", "ADMIN", "RECEPTIONIST"

    private String displayName;

    private String preferredLanguage;

    private boolean deleted = false;

    private LocalDateTime lastLoginAt;
}
