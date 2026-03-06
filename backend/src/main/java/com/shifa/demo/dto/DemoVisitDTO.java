package com.shifa.demo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * DemoVisitDTO — Full visit record for demo mode.
 *
 * Returned as part of DemoPatientDTO.visits
 * and by GET /api/v1/demo/patients/{patientId}/visits/{visitId}
 */
@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DemoVisitDTO {

    // ── Visit meta ─────────────────────────────────────────────────────────
    String id;
    String date;
    String dateShort;        // "MAR 4"
    String type;             // "OPD Consultation" | "Follow-up" | "Urgent"
    String doctorId;

    // ── Summaries ──────────────────────────────────────────────────────────
    String summary;
    String quickSummary;     // Plain language — shown to patient at top

    // ── SOAP sections ──────────────────────────────────────────────────────
    SoapSections sections;

    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SoapSections {
        String chiefComplaint;
        String historyOfPresentIllness;
        List<String> reportedSymptoms;
        String physicalExamination;
        String assessment;
        List<String> plan;
        String diagnosis;
        List<NextAction> nextActions;
        List<TestResult> testResults;
        List<Medication> medications;
        String transcript;
    }

    // ── Next action (checklist item) ───────────────────────────────────────
    @Value
    @Builder
    public static class NextAction {
        String  id;
        String  text;
        boolean done;
    }

    // ── Test result ────────────────────────────────────────────────────────
    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TestResult {
        String name;
        String value;
        String status;      // "normal" | "high" | "low" | "borderline" | "abnormal" | "pending"
        String reference;
        String date;
        String category;    // "Vitals" | "Lab" | "Exams"
    }

    // ── Prescribed medication ──────────────────────────────────────────────
    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Medication {
        String       name;
        String       dose;
        String       frequency;
        String       timing;
        String       duration;
        String       purpose;
        List<String> sideEffects;
        String       warning;
    }
}