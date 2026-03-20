package com.shifa.demo;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DemoPatientResponse {
    @JsonIgnoreProperties({"visits", "user", "doctors", "practitioner"})
    private Patient patient;

    @JsonIgnoreProperties({"patient", "doctor", "practitioner"})
    private List<Visit> visits;
}
