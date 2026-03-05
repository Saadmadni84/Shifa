package com.shifa.event;

import com.shifa.domain.patient.Patient;
import org.springframework.context.ApplicationEvent;

public class PatientRegisteredEvent extends ApplicationEvent {
    private final Patient patient;

    public PatientRegisteredEvent(Object source, Patient patient) {
        super(source);
        this.patient = patient;
    }

    public Patient getPatient() { return patient; }
}
