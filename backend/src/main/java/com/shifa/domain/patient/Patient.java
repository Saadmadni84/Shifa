package com.shifa.domain.patient;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(unique = true)
    private String phoneNumber; // For WhatsApp

    private LocalDate dateOfBirth;
    
    private String gender; // M, F, O

    private String preferredLanguage; // en, hi, ta, etc.
}
