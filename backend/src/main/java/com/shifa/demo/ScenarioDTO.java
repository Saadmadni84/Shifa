package com.shifa.demo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;

import java.util.List;
import lombok.Data;

@Data
public class ScenarioDTO {
    private String id;
    private String name;
    private String condition;
    private String preferredLanguage;
    private int age;
    
    @JsonIgnoreProperties({"patient", "doctor", "practitioner"})
    private List<Visit> visits;

    public ScenarioDTO(Patient p) {
        this.id = p.getId() != null ? p.getId().toString() : null;
        this.name = p.getFullName();
        this.condition = p.getKnownConditionsText() != null ? p.getKnownConditionsText() : "None";
        this.preferredLanguage = p.getPreferredLanguage() != null ? p.getPreferredLanguage().name() : "EN";
        this.age = p.getAge();
        this.visits = p.getVisits();
    }
}
