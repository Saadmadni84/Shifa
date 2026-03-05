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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String name;

    public String getFullName() {
        return name;
    }

    private String abhaId;

    @Column(unique = true)
    private String phoneNumber; // For WhatsApp

    private LocalDate dateOfBirth;

    private String gender; // M, F, O

    private String preferredLanguage; // en, hi, ta, etc.

    private boolean deleted = false;

    private LocalDateTime deletedAt;

    private String deleteReason;
}
