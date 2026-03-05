package com.shifa.domain.visit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.shifa.domain.doctor.dto.DoctorSummaryResponse;
import com.shifa.domain.patient.dto.PatientSummaryResponse;
import com.shifa.domain.prescription.dto.PrescriptionResponse;
import com.shifa.domain.vitals.dto.VitalsResponse;
import com.shifa.domain.visit.VisitSummaryData;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VisitResponse {

    String id;
    String status;
    LocalDate visitDate;
    String visitType;

    PatientSummaryResponse patient;
    DoctorSummaryResponse doctor;

    String chiefComplaint;
    String rawNotes;
    String diagnosis;

    VisitSummaryData aiSummary;
    String aiSummaryStatus;
    LocalDateTime aiProcessedAt;

    Map<String, String> patientSummaries;

    PrescriptionResponse prescription;
    VitalsResponse vitals;

    LocalDate followUpDate;
    String followUpNotes;

    String whatsappStatus;
    LocalDateTime whatsappSentAt;
    LocalDateTime whatsappDeliveredAt;
    LocalDateTime whatsappReadAt;

    String patientPortalUrl;
    LocalDateTime portalExpiresAt;
    boolean portalAccessValid;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
