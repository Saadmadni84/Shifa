// DoctorService
// backend/src/main/java/com/shifa/service/DoctorService.java
package com.shifa.service;

import com.shifa.dto.*;
import com.shifa.dto.DashboardResponseDto.*;
import com.shifa.dto.PatientSummaryDto.*;
import com.shifa.dto.VisitDetailDto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * DoctorService
 *
 * Orchestrates data access for doctor-facing endpoints.
 * In demo mode: returns hard-coded Indian patient data.
 * In live mode: delegates to repositories.
 *
 * Swap the demo block for real JPA repository calls when your
 * database layer is ready — the API contract stays identical.
 */
@Service
@RequiredArgsConstructor
public class DoctorService {

    // ── Demo Data ────────────────────────────────────────────────────────────
    // Mirrors frontend/src/data/demo/doctorDemoData.js exactly so both sides
    // return identical data whether running full-stack or frontend-only.

    private static final DoctorDto DEMO_DOCTOR = DoctorDto.builder()
            .id("d1")
            .name("Dr. Priya Sharma")
            .specialty("General Physician & Diabetologist")
            .hospital("Apollo Clinic, Prayagraj")
            .avatar("PS")
            .phone("+91-9876543210")
            .build();

    private static final List<PatientSummaryDto> DEMO_PATIENTS = buildDemoPatients();
    private static final Map<String, List<VisitDetailDto>> DEMO_VISITS = buildDemoVisits();

    // ── Dashboard ────────────────────────────────────────────────────────────

    public DashboardResponseDto getDashboard(String doctorId, boolean demo) {
        if (demo) {
            List<PatientSummaryDto> alertPatients = DEMO_PATIENTS.stream()
                    .filter(p -> "alert".equals(p.getAlertStatus()))
                    .collect(Collectors.toList());

            List<AlertDto> alerts = alertPatients.stream()
                    .map(p -> AlertDto.builder()
                            .patientId(p.getId())
                            .patientName(p.getFirstName() + " " + p.getLastName())
                            .type(p.getPrimaryCondition().replaceAll("\\s*\\(.*?\\)", "").trim())
                            .detail("Last BP: " + p.getLastVitals().getBp()
                                    + " | Last Sugar: " + p.getLastVitals().getSugar())
                            .date(p.getLastVisitDate())
                            .avatar(p.getAvatar())
                            .build())
                    .collect(Collectors.toList());

            List<PatientSummaryDto> recent = DEMO_PATIENTS.stream()
                    .sorted(Comparator.comparing(PatientSummaryDto::getLastVisitDate).reversed())
                    .limit(4)
                    .collect(Collectors.toList());

            int totalVisits = DEMO_VISITS.values().stream().mapToInt(List::size).sum();
            int unread = DEMO_PATIENTS.stream().mapToInt(PatientSummaryDto::getUnreadCount).sum();

            StatsDto stats = StatsDto.builder()
                    .totalPatients(DEMO_PATIENTS.size())
                    .unreadMessages(unread)
                    .totalVisits(totalVisits)
                    .alertPatients(alertPatients.size())
                    .build();

            return DashboardResponseDto.builder()
                    .doctor(DEMO_DOCTOR)
                    .stats(stats)
                    .alerts(alerts)
                    .recentPatients(recent)
                    .build();
        }
        // TODO: live implementation — inject PatientRepository, VisitRepository
        throw new UnsupportedOperationException("Live mode not yet implemented");
    }

    // ── Patients ─────────────────────────────────────────────────────────────

    public List<PatientSummaryDto> getPatients(
            String doctorId, String q, String status, int page, int size, boolean demo) {
        if (demo) {
            return DEMO_PATIENTS.stream()
                    .filter(p -> q == null || q.isBlank() ||
                            (p.getFirstName() + " " + p.getLastName()).toLowerCase().contains(q.toLowerCase()) ||
                            (p.getPrimaryCondition() != null && p.getPrimaryCondition().toLowerCase().contains(q.toLowerCase())))
                    .filter(p -> status == null || status.isBlank() || status.equals(p.getAlertStatus()))
                    .skip((long) page * size)
                    .limit(size)
                    .collect(Collectors.toList());
        }
        throw new UnsupportedOperationException("Live mode not yet implemented");
    }

    public PatientSummaryDto getPatientDetail(String patientId, boolean demo) {
        if (demo) {
            return DEMO_PATIENTS.stream()
                    .filter(p -> p.getId().equals(patientId))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchElementException("Patient not found: " + patientId));
        }
        throw new UnsupportedOperationException("Live mode not yet implemented");
    }

    // ── Visits ───────────────────────────────────────────────────────────────

    public List<VisitDetailDto> getPatientVisits(String patientId, boolean demo) {
        if (demo) {
            return DEMO_VISITS.getOrDefault(patientId, Collections.emptyList());
        }
        throw new UnsupportedOperationException("Live mode not yet implemented");
    }

    public VisitDetailDto getVisitDetail(String patientId, String visitId, boolean demo) {
        if (demo) {
            return DEMO_VISITS.getOrDefault(patientId, Collections.emptyList()).stream()
                    .filter(v -> v.getId().equals(visitId))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchElementException("Visit not found: " + visitId));
        }
        throw new UnsupportedOperationException("Live mode not yet implemented");
    }

    public List<VisitDetailDto> getAllVisits(
            String doctorId, String q, int page, int size, boolean demo) {
        if (demo) {
            return DEMO_VISITS.values().stream()
                    .flatMap(Collection::stream)
                    .filter(v -> q == null || q.isBlank() ||
                            (v.getDiagnosis() != null && v.getDiagnosis().toLowerCase().contains(q.toLowerCase())))
                    .sorted(Comparator.comparing(VisitDetailDto::getDate).reversed())
                    .skip((long) page * size)
                    .limit(size)
                    .collect(Collectors.toList());
        }
        throw new UnsupportedOperationException("Live mode not yet implemented");
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Demo Data Builders — mirrors doctorDemoData.js
    // ════════════════════════════════════════════════════════════════════════

    private static List<PatientSummaryDto> buildDemoPatients() {
        List<PatientSummaryDto> list = new ArrayList<>();

        list.add(PatientSummaryDto.builder()
                .id("p1").firstName("Rajesh").lastName("Kumar").age(52)
                .dob("1972-04-10").gender("Male").language("hi").languageLabel("Hindi")
                .phone("+91-9812345678").avatar("RK").alertStatus("alert").unreadCount(3)
                .primaryCondition("Premature Ventricular Contractions (I49.3)")
                .lastVisitDate("2026-03-05").summaryLanguage("Hindi")
                .whatsappDeliveryStatus("Delivered")
                .lastVitals(LastVitals.builder().bp("148/94").sugar("138 mg/dL").weight("78 kg").pulse("82 bpm").build())
                .activeConditions(List.of(
                        ConditionDto.builder().code("I49.3").display("Premature Ventricular Contractions").status("active").build(),
                        ConditionDto.builder().code("I10").display("Hypertension").status("active").build(),
                        ConditionDto.builder().code("E11").display("Type 2 Diabetes Mellitus").status("active").build()
                ))
                .activeMedications(List.of(
                        MedicationDto.builder().name("Metoprolol").dose("25 mg").frequency("Once daily (OD)").timing("Morning").build(),
                        MedicationDto.builder().name("Telmisartan").dose("40 mg").frequency("Once daily (OD)").timing("Morning").build(),
                        MedicationDto.builder().name("Metformin").dose("500 mg").frequency("Twice daily (BD)").timing("After meals").build()
                ))
                .build());

        list.add(PatientSummaryDto.builder()
                .id("p2").firstName("Sunita").lastName("Devi").age(45)
                .dob("1980-08-22").gender("Female").language("hi").languageLabel("Hindi")
                .phone("+91-9823456789").avatar("SD").alertStatus("review").unreadCount(1)
                .primaryCondition("Hypothyroidism (E03.9)")
                .lastVisitDate("2026-02-28").summaryLanguage("Hindi")
                .whatsappDeliveryStatus("Read")
                .lastVitals(LastVitals.builder().bp("126/82").sugar("112 mg/dL").weight("68 kg").pulse("72 bpm").build())
                .activeConditions(List.of(
                        ConditionDto.builder().code("E03.9").display("Hypothyroidism, unspecified").status("active").build()
                ))
                .activeMedications(List.of(
                        MedicationDto.builder().name("Levothyroxine").dose("50 mcg").frequency("Once daily (OD)").timing("Empty stomach, morning").build()
                ))
                .build());

        list.add(PatientSummaryDto.builder()
                .id("p3").firstName("Mohammed").lastName("Iqbal").age(61)
                .dob("1964-11-05").gender("Male").language("ur").languageLabel("Urdu")
                .phone("+91-9834567890").avatar("MI").alertStatus("alert").unreadCount(5)
                .primaryCondition("Chronic Obstructive Pulmonary Disease (J44.1)")
                .lastVisitDate("2026-03-01").summaryLanguage("Urdu")
                .whatsappDeliveryStatus("Delivered")
                .lastVitals(LastVitals.builder().bp("158/96").sugar("165 mg/dL").weight("71 kg").pulse("94 bpm").build())
                .activeConditions(List.of(
                        ConditionDto.builder().code("J44.1").display("COPD with acute exacerbation").status("active").build(),
                        ConditionDto.builder().code("E11").display("Type 2 Diabetes Mellitus").status("active").build(),
                        ConditionDto.builder().code("I10").display("Hypertension").status("active").build()
                ))
                .activeMedications(List.of(
                        MedicationDto.builder().name("Tiotropium Inhaler").dose("18 mcg").frequency("Once daily (OD)").timing("Morning").build(),
                        MedicationDto.builder().name("Salbutamol Inhaler").dose("100 mcg").frequency("As needed (SOS)").timing("On breathlessness").build(),
                        MedicationDto.builder().name("Amlodipine").dose("5 mg").frequency("Once daily (OD)").timing("Evening").build()
                ))
                .build());

        list.add(PatientSummaryDto.builder()
                .id("p4").firstName("Kavitha").lastName("Nair").age(38)
                .dob("1987-03-15").gender("Female").language("ml").languageLabel("Malayalam")
                .phone("+91-9845678901").avatar("KN").alertStatus("stable").unreadCount(0)
                .primaryCondition("Polycystic Ovarian Syndrome (E28.2)")
                .lastVisitDate("2026-02-20").summaryLanguage("Malayalam")
                .whatsappDeliveryStatus("Read")
                .lastVitals(LastVitals.builder().bp("118/76").sugar("98 mg/dL").weight("64 kg").pulse("68 bpm").build())
                .activeConditions(List.of(
                        ConditionDto.builder().code("E28.2").display("Polycystic Ovarian Syndrome (PCOS)").status("active").build()
                ))
                .activeMedications(List.of(
                        MedicationDto.builder().name("Metformin").dose("500 mg").frequency("Twice daily (BD)").timing("After meals").build(),
                        MedicationDto.builder().name("Inositol").dose("2 g").frequency("Once daily (OD)").timing("Morning").build()
                ))
                .build());

        list.add(PatientSummaryDto.builder()
                .id("p5").firstName("Arjun").lastName("Singh").age(29)
                .dob("1996-07-20").gender("Male").language("hi").languageLabel("Hindi")
                .phone("+91-9856789012").avatar("AS").alertStatus("stable").unreadCount(0)
                .primaryCondition("Acid Peptic Disease (K29.7)")
                .lastVisitDate("2026-03-06").summaryLanguage("Hindi")
                .whatsappDeliveryStatus("Read")
                .lastVitals(LastVitals.builder().bp("122/78").sugar("92 mg/dL").weight("72 kg").pulse("74 bpm").build())
                .activeConditions(List.of(
                        ConditionDto.builder().code("K29.7").display("Gastritis / Acid Peptic Disease").status("active").build()
                ))
                .activeMedications(List.of(
                        MedicationDto.builder().name("Pantoprazole").dose("40 mg").frequency("Once daily (OD)").timing("Before breakfast").build(),
                        MedicationDto.builder().name("Domperidone").dose("10 mg").frequency("Thrice daily (TDS)").timing("Before meals").build()
                ))
                .build());

        return Collections.unmodifiableList(list);
    }

    private static Map<String, List<VisitDetailDto>> buildDemoVisits() {
        Map<String, List<VisitDetailDto>> map = new HashMap<>();

        // Rajesh Kumar — p1
        map.put("p1", List.of(
                VisitDetailDto.builder()
                        .id("v1-1").patientId("p1").date("2026-03-05").type("Follow-up").doctor("Dr. Priya Sharma")
                        .diagnosis("Premature Ventricular Contractions (I49.3) — benign")
                        .chiefComplaint("Palpitations, occasional dizziness")
                        .clinicalNotes("Patient reports intermittent palpitations over past 2 weeks. ECG shows occasional PVCs. BP elevated at 148/94. Blood sugar 138 mg/dL (fasting). No chest pain, no syncope. Lungs clear.")
                        .instructions("Start Metoprolol 25mg OD, continue Telmisartan + Metformin, monitor BP daily, limit caffeine. Return in 4 weeks or earlier if palpitations worsen. Avoid strenuous exercise.")
                        .followUpDate("2026-04-02")
                        .vitals(VitalsDto.builder().bp("148/94").pulse("82").weight("78").sugar("138").build())
                        .prescriptions(List.of(
                                PrescriptionDto.builder().name("Tab. Metoprolol 25mg").sig("1-0-0 (After breakfast)").duration("30 days").refills(1).build(),
                                PrescriptionDto.builder().name("Tab. Telmisartan 40mg").sig("1-0-0 (Before breakfast)").duration("30 days").refills(2).build(),
                                PrescriptionDto.builder().name("Tab. Metformin 500mg").sig("1-0-1 (After meals)").duration("30 days").refills(2).build()
                        ))
                        .whatsappSummary(WhatsAppSummaryDto.builder()
                                .sent(true).language("Hindi").status("Delivered")
                                .timestamp("2026-03-05T11:42:00")
                                .preview("नमस्ते राजेश जी! आपकी आज की जाँच के बाद डॉ. प्रिया शर्मा की ओर से:\n\n✅ निदान: दिल में छोटे-छोटे अनियमित धड़कन (PVCs) — घबराने की बात नहीं\n\n💊 दवाइयाँ:\n1. मेटोप्रोलोल 25mg — सुबह नाश्ते के बाद\n2. टेल्मिसार्टन 40mg — सुबह खाली पेट\n3. मेटफॉर्मिन 500mg — सुबह-शाम खाने के बाद\n\n⚠️ ध्यान दें: चाय/कॉफी कम करें, BP रोज नापें।\n\n📅 अगली मुलाक़ात: 4 हफ्ते बाद")
                                .build())
                        .build(),

                VisitDetailDto.builder()
                        .id("v1-2").patientId("p1").date("2026-02-10").type("Consultation").doctor("Dr. Priya Sharma")
                        .diagnosis("Hypertension Stage 2, Type 2 Diabetes (uncontrolled)")
                        .chiefComplaint("Headache, fatigue")
                        .clinicalNotes("BP 156/98 on two readings. HbA1c 8.2%. Patient non-compliant with diet. Advised lifestyle changes.")
                        .instructions("Continue Telmisartan. Add Metformin. Low-salt diet, reduce sugar intake. Follow up in 4 weeks.")
                        .followUpDate("2026-03-05")
                        .vitals(VitalsDto.builder().bp("156/98").pulse("88").weight("79").sugar("162").build())
                        .prescriptions(List.of(
                                PrescriptionDto.builder().name("Tab. Telmisartan 40mg").sig("1-0-0").duration("30 days").refills(2).build(),
                                PrescriptionDto.builder().name("Tab. Metformin 500mg").sig("1-0-1").duration("30 days").refills(2).build()
                        ))
                        .whatsappSummary(WhatsAppSummaryDto.builder().sent(true).language("Hindi").status("Read").timestamp("2026-02-10T10:15:00").build())
                        .build()
        ));

        // Mohammed Iqbal — p3 (alert case)
        map.put("p3", List.of(
                VisitDetailDto.builder()
                        .id("v3-1").patientId("p3").date("2026-03-01").type("Emergency OPD").doctor("Dr. Priya Sharma")
                        .diagnosis("COPD Acute Exacerbation (J44.1) with uncontrolled Diabetes")
                        .chiefComplaint("Increased breathlessness, cough with yellow sputum")
                        .clinicalNotes("SpO2 94% on room air. Chest X-ray shows hyperinflation. BP 158/96. Sugar 165 mg/dL. Sputum sent for culture. Started on nebulization.")
                        .instructions("Tiotropium inhaler daily. Salbutamol as needed. Course of Azithromycin 3 days. Monitor SpO2. Return immediately if SpO2 drops below 92%.")
                        .followUpDate("2026-03-08")
                        .vitals(VitalsDto.builder().bp("158/96").pulse("94").weight("71").sugar("165").spo2("94%").build())
                        .prescriptions(List.of(
                                PrescriptionDto.builder().name("Tiotropium Inhaler 18mcg").sig("2 puffs OD (Morning)").duration("30 days").refills(2).build(),
                                PrescriptionDto.builder().name("Salbutamol Inhaler 100mcg").sig("2 puffs SOS").duration("30 days").refills(1).build(),
                                PrescriptionDto.builder().name("Tab. Azithromycin 500mg").sig("1-0-0").duration("3 days").refills(0).build()
                        ))
                        .whatsappSummary(WhatsAppSummaryDto.builder().sent(true).language("Urdu").status("Delivered").timestamp("2026-03-01T15:00:00").build())
                        .build()
        ));

        // Sunita Devi — p2
        map.put("p2", List.of(
                VisitDetailDto.builder()
                        .id("v2-1").patientId("p2").date("2026-02-28").type("Follow-up").doctor("Dr. Priya Sharma")
                        .diagnosis("Hypothyroidism — suboptimal control")
                        .chiefComplaint("Tiredness, weight gain, cold intolerance")
                        .clinicalNotes("TSH 7.2 mIU/L (high). Currently on Levothyroxine 25mcg. Dose increased to 50mcg.")
                        .instructions("Increase Levothyroxine to 50mcg. Take on empty stomach 30 min before breakfast. Recheck TSH after 6 weeks.")
                        .followUpDate("2026-04-10")
                        .vitals(VitalsDto.builder().bp("126/82").pulse("72").weight("68").sugar("112").build())
                        .prescriptions(List.of(
                                PrescriptionDto.builder().name("Tab. Levothyroxine 50mcg").sig("1-0-0 (Empty stomach)").duration("45 days").refills(1).build()
                        ))
                        .whatsappSummary(WhatsAppSummaryDto.builder().sent(true).language("Hindi").status("Read").timestamp("2026-02-28T09:30:00").build())
                        .build()
        ));

        // Kavitha Nair — p4
        map.put("p4", List.of(
                VisitDetailDto.builder()
                        .id("v4-1").patientId("p4").date("2026-02-20").type("Follow-up").doctor("Dr. Priya Sharma")
                        .diagnosis("PCOS with insulin resistance")
                        .chiefComplaint("Irregular periods, weight gain")
                        .clinicalNotes("LH/FSH ratio 2.5. Fasting insulin elevated. Continue Metformin. Add Inositol supplement.")
                        .instructions("Continue Metformin 500mg BD. Start Inositol 2g OD. Low-GI diet. Brisk walk 30 min daily.")
                        .followUpDate("2026-04-20")
                        .vitals(VitalsDto.builder().bp("118/76").pulse("68").weight("64").sugar("98").build())
                        .prescriptions(List.of(
                                PrescriptionDto.builder().name("Tab. Metformin 500mg").sig("1-0-1 (After meals)").duration("60 days").refills(2).build(),
                                PrescriptionDto.builder().name("Inositol Powder 2g").sig("1-0-0 (Morning)").duration("60 days").refills(1).build()
                        ))
                        .whatsappSummary(WhatsAppSummaryDto.builder().sent(true).language("Malayalam").status("Read").timestamp("2026-02-20T11:00:00").build())
                        .build()
        ));

        // Arjun Singh — p5
        map.put("p5", List.of(
                VisitDetailDto.builder()
                        .id("v5-1").patientId("p5").date("2026-03-06").type("Consultation").doctor("Dr. Priya Sharma")
                        .diagnosis("Acute Gastritis / Acid Peptic Disease (K29.7)")
                        .chiefComplaint("Burning pain upper abdomen, nausea after meals")
                        .clinicalNotes("H. pylori rapid test negative. Likely stress-related APD. Advised dietary changes.")
                        .instructions("Pantoprazole 40mg before breakfast. Domperidone before meals. Avoid spicy/oily food, tea on empty stomach, NSAIDs.")
                        .followUpDate("2026-03-20")
                        .vitals(VitalsDto.builder().bp("122/78").pulse("74").weight("72").sugar("92").build())
                        .prescriptions(List.of(
                                PrescriptionDto.builder().name("Tab. Pantoprazole 40mg").sig("1-0-0 (Before breakfast)").duration("14 days").refills(0).build(),
                                PrescriptionDto.builder().name("Tab. Domperidone 10mg").sig("1-1-1 (Before meals)").duration("14 days").refills(0).build()
                        ))
                        .whatsappSummary(WhatsAppSummaryDto.builder().sent(true).language("Hindi").status("Read").timestamp("2026-03-06T13:20:00").build())
                        .build()
        ));

        return Collections.unmodifiableMap(map);
    }
}
