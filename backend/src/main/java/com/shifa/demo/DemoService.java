package com.shifa.demo;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DemoService {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public List<Patient> getScenarios() {
        return patientRepository.findByIsDemoTrue();
    }

    public DemoPatientResponse getScenario(UUID id) {
        Patient patient = patientRepository.findById(id).orElseThrow();
        List<Visit> visits = visitRepository.findByPatientId(id);

        return new DemoPatientResponse(patient, visits);
    }
}
