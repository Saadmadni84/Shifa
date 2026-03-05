package com.shifa.demo.data;

import com.shifa.demo.dto.DemoDoctorDTO;
import com.shifa.demo.dto.DemoPatientDTO;
import com.shifa.demo.dto.DemoVisitDTO;
import com.shifa.demo.dto.DemoVisitDTO.Medication;
import com.shifa.demo.dto.DemoVisitDTO.NextAction;
import com.shifa.demo.dto.DemoVisitDTO.SoapSections;
import com.shifa.demo.dto.DemoVisitDTO.TestResult;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * DemoDataStore — Static in-memory demo data for Shifa.
 * ─────────────────────────────────────────────────────────────────────────────
 * Contains 3 fictional Indian patients + 3 fictional Indian doctors.
 * All names, diagnoses, prescriptions, and test results are entirely fictional
 * and created solely for demonstration purposes.
 *
 * This class is a Spring @Component — data is built once at startup and cached.
 * No database calls, no external dependencies.
 *
 * Patients:
 *   pat-001 — Arjun Sharma     — Cardiology  — PVCs          — Hindi
 *   pat-002 — Priya Patel      — Diabetes    — HbA1c 8.2%    — Gujarati
 *   pat-003 — Ravi Kumar       — Pulmonology — Asthma flare  — Kannada
 *
 * Doctors:
 *   doc-001 — Dr. Ananya Krishnan  — Cardiologist    — Apollo Chennai
 *   doc-002 — Dr. Suresh Mehta    — Endocrinologist  — Hinduja Mumbai
 *   doc-003 — Dr. Kavita Rao      — Pulmonologist    — Manipal Bangalore
 * ─────────────────────────────────────────────────────────────────────────────
 */
public final class DemoDataStore {

    private DemoDataStore() {}

    // ─── Doctors ──────────────────────────────────────────────────────────────

    public static final List<DemoDoctorDTO> DOCTORS = List.of(

        DemoDoctorDTO.builder()
            .id("doc-001")
            .name("Dr. Ananya Krishnan")
            .specialty("Cardiology")
            .qualifications("MBBS, MD (Cardiology), DM — AIIMS Delhi")
            .hospital("Apollo Hospitals, Chennai")
            .phone("+91-44-2829-3333")
            .email("ananya.krishnan@apollochennai.in")
            .initials("AK")
            .color("#10b981")
            .patientIds(List.of("pat-001"))
            .stats(DemoDoctorDTO.DoctorStats.builder()
                .totalPatients(42).visitsThisWeek(18).pendingReports(3).newMessages(5).build())
            .build(),

        DemoDoctorDTO.builder()
            .id("doc-002")
            .name("Dr. Suresh Mehta")
            .specialty("Endocrinology & Diabetology")
            .qualifications("MBBS, MD, DM (Endocrinology) — KEM Mumbai")
            .hospital("Hinduja Hospital, Mumbai")
            .phone("+91-22-2445-1515")
            .email("suresh.mehta@hinduja.org")
            .initials("SM")
            .color("#6366f1")
            .patientIds(List.of("pat-002"))
            .stats(DemoDoctorDTO.DoctorStats.builder()
                .totalPatients(55).visitsThisWeek(22).pendingReports(7).newMessages(3).build())
            .build(),

        DemoDoctorDTO.builder()
            .id("doc-003")
            .name("Dr. Kavita Rao")
            .specialty("Pulmonology & Respiratory Medicine")
            .qualifications("MBBS, MD (Pulmonology) — JIPMER Puducherry")
            .hospital("Manipal Hospitals, Bangalore")
            .phone("+91-80-2502-4444")
            .email("kavita.rao@manipalhospitals.com")
            .initials("KR")
            .color("#f59e0b")
            .patientIds(List.of("pat-003"))
            .stats(DemoDoctorDTO.DoctorStats.builder()
                .totalPatients(38).visitsThisWeek(15).pendingReports(2).newMessages(8).build())
            .build()
    );

    // ─── Patients ──────────────────────────────────────────────────────────────

    public static final List<DemoPatientDTO> PATIENTS = List.of(

        // ── Patient 1: Arjun Sharma — Cardiology ──────────────────────────────
        DemoPatientDTO.builder()
            .id("pat-001")
            .name("Arjun Sharma")
            .age(52).gender("Male").dateOfBirth("12 March 1973")
            .city("New Delhi").phone("+91-98100-XXXXX")
            .email("arjun.sharma@demo.shifa.health")
            .bloodGroup("B+").bmi(27.4)
            .initials("AS").avatarColor("#10b981")
            .language("Hindi").languageCode("hi")
            .specialty("cardiology")
            .shortDescription("Chest discomfort and irregular heartbeat for 2 weeks. ECG shows frequent PVCs.")
            .conditions(List.of("Premature Ventricular Complexes (PVCs)", "Mild Hyperlipidaemia"))
            .currentMedications(List.of("Propranolol 40mg BD", "Atorvastatin 10mg OD"))
            .doctorId("doc-001")
            .visits(List.of(
                DemoVisitDTO.builder()
                    .id("visit-001-a")
                    .date("4 March 2026").dateShort("MAR 4")
                    .type("OPD Consultation").doctorId("doc-001")
                    .summary("Patient presents with 2-week history of chest discomfort and palpitations. ECG confirms frequent PVCs. Started on Propranolol 40mg BD.")
                    .quickSummary("Arjun came with 2 weeks of chest thumping and irregular heartbeat. ECG confirmed PVCs. Started on Propranolol 40mg twice daily.")
                    .sections(SoapSections.builder()
                        .chiefComplaint("Chest discomfort and palpitations for the past 2 weeks. Describes sensation as 'dil ka dhak-dhak' — heart pounding irregularly, worse on exertion.")
                        .historyOfPresentIllness("Mr. Sharma is a 52-year-old male presenting with intermittent palpitations for 2 weeks. He reports a fluttering sensation in his chest, occasional dizziness, and shortness of breath on climbing two flights of stairs. No syncope. No chest pain radiating to the arm. Non-smoker. Moderate alcohol use (2–3 drinks on weekends). Desk job with minimal physical activity.")
                        .reportedSymptoms(List.of(
                            "Palpitations — irregular, fluttering quality",
                            "Mild dizziness, especially on standing quickly",
                            "Shortness of breath on exertion (climbing stairs)",
                            "No syncope, no chest pain at rest",
                            "Mild fatigue over the past 2 weeks"
                        ))
                        .physicalExamination("BP: 138/88 mmHg (right arm, sitting). HR: 74 bpm, irregular. SpO2: 98% room air. Heart: S1 S2 heard, frequent ectopic beats noted. No murmurs. Lungs: clear bilaterally. No pedal oedema.")
                        .assessment("Frequent Premature Ventricular Complexes (PVCs) likely triggered by stress and caffeine. Mild hyperlipidaemia noted. Structurally normal heart on 2D Echo. Clinically benign PVCs in absence of structural disease.")
                        .plan(List.of(
                            "Start Propranolol 40mg BD (twice daily with meals)",
                            "Reduce caffeine intake — limit to 1 cup of chai/coffee per day",
                            "Reduce stress — walking 30 min/day recommended",
                            "Atorvastatin 10mg OD for hyperlipidaemia",
                            "Holter monitor in 4 weeks to quantify PVC burden",
                            "Follow-up in 2 weeks for BP and medication tolerance"
                        ))
                        .diagnosis("Frequent Premature Ventricular Complexes (PVCs) — benign, idiopathic. Mild hyperlipidaemia.")
                        .nextActions(List.of(
                            NextAction.builder().id("na-1").text("Take Propranolol 40mg tablet twice daily — morning and evening, with food").done(false).build(),
                            NextAction.builder().id("na-2").text("Holter monitor scheduled — 4 weeks from today").done(false).build(),
                            NextAction.builder().id("na-3").text("Return for BP check and medication review in 2 weeks").done(false).build(),
                            NextAction.builder().id("na-4").text("Reduce tea/coffee to 1 cup per day").done(false).build()
                        ))
                        .testResults(List.of(
                            TestResult.builder().name("Blood Pressure").value("138/88 mmHg").status("borderline").reference("<130/80").date("4 Mar 2026").category("Vitals").build(),
                            TestResult.builder().name("12-Lead ECG").value("Sinus rhythm, frequent PVCs. No ST changes.").status("abnormal").reference("Normal sinus").date("4 Mar 2026").category("Exams").build(),
                            TestResult.builder().name("2D Echocardiography").value("EF 60%, normal wall motion, no valvular abnormality").status("normal").reference("EF >55%").date("4 Mar 2026").category("Exams").build(),
                            TestResult.builder().name("Total Cholesterol").value("228 mg/dL").status("high").reference("<200 mg/dL").date("4 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("LDL Cholesterol").value("148 mg/dL").status("high").reference("<100 mg/dL").date("4 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("HDL Cholesterol").value("42 mg/dL").status("normal").reference(">40 mg/dL").date("4 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Fasting Blood Sugar").value("98 mg/dL").status("normal").reference("70–100 mg/dL").date("4 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Serum Potassium").value("4.1 mEq/L").status("normal").reference("3.5–5.0 mEq/L").date("4 Mar 2026").category("Lab").build()
                        ))
                        .medications(List.of(
                            Medication.builder()
                                .name("Propranolol").dose("40mg").frequency("Twice daily (BD)")
                                .timing("With meals — morning and evening").duration("4 weeks then review")
                                .purpose("To slow and regularise the heart rhythm")
                                .sideEffects(List.of("Fatigue", "Cold hands/feet", "Dizziness on standing"))
                                .warning("Do NOT stop suddenly — taper under doctor supervision")
                                .build(),
                            Medication.builder()
                                .name("Atorvastatin").dose("10mg").frequency("Once daily (OD)")
                                .timing("At night, after dinner").duration("Long-term")
                                .purpose("To lower cholesterol")
                                .sideEffects(List.of("Mild muscle ache", "Elevated liver enzymes (rare)"))
                                .warning("Avoid grapefruit juice")
                                .build()
                        ))
                        .transcript("""
Dr. Krishnan: Good morning Arjun ji, please sit. So you're having some heart issues?

Arjun: Haan doctor, dil mein dhak-dhak ho rahi hai. About 2 weeks. Sometimes I feel dizzy also.

Dr. Krishnan: I see. Does it happen at rest or on exertion?

Arjun: More when I climb stairs or hurry. But also at rest sometimes.

Dr. Krishnan: Any chest pain, sweating, or fainting?

Arjun: No no — nothing like that. Just this flutter feeling.

Dr. Krishnan: OK. We did your ECG — it shows frequent extra beats from the lower chambers, called PVCs. The echo is completely normal — your heart's structure is fine.

Arjun: PVC matlab? Serious hai?

Dr. Krishnan: PVC stands for Premature Ventricular Contractions. In a structurally normal heart like yours, these are benign — not dangerous. But we treat them because they're causing symptoms.

Arjun: Theek hai. Medicine leni padegi?

Dr. Krishnan: Yes. I'm starting Propranolol 40mg twice a day. Take with food. Also, please cut down your chai and coffee — that can trigger PVCs. And walking 30 minutes daily will help.""")
                        .build())
                    .build()
            ))
            .build(),

        // ── Patient 2: Priya Patel — Endocrinology / Diabetes ─────────────────
        DemoPatientDTO.builder()
            .id("pat-002")
            .name("Priya Patel")
            .age(45).gender("Female").dateOfBirth("7 August 1980")
            .city("Ahmedabad").phone("+91-99090-XXXXX")
            .email("priya.patel@demo.shifa.health")
            .bloodGroup("A+").bmi(29.1)
            .initials("PP").avatarColor("#6366f1")
            .language("Gujarati").languageCode("gu")
            .specialty("endocrinology")
            .shortDescription("Type 2 diabetes follow-up. HbA1c elevated at 8.2%. Medication adjustment required.")
            .conditions(List.of("Type 2 Diabetes Mellitus", "Hypothyroidism"))
            .currentMedications(List.of("Metformin 500mg BD", "Levothyroxine 50mcg OD"))
            .doctorId("doc-002")
            .visits(List.of(
                DemoVisitDTO.builder()
                    .id("visit-002-a")
                    .date("3 March 2026").dateShort("MAR 3")
                    .type("Follow-up Consultation").doctorId("doc-002")
                    .summary("Priya presents for 3-month diabetes follow-up. HbA1c has risen to 8.2%. Metformin dose increased and dietary counselling given.")
                    .quickSummary("Priya's sugar control has worsened — HbA1c is 8.2% (was 7.4% last time). Metformin dose increased. Diet counselling done. Thyroid is stable.")
                    .sections(SoapSections.builder()
                        .chiefComplaint("Routine 3-month follow-up for Type 2 Diabetes. Patient also reports increased thirst and fatigue over the past month.")
                        .historyOfPresentIllness("Mrs. Patel is a 45-year-old female with known Type 2 Diabetes (diagnosed 4 years ago) and Hypothyroidism. She presents for her quarterly review. Over the past month she has experienced increased thirst, polyuria (especially at night), and fatigue. She has been less regular with her diet during the festival season.")
                        .reportedSymptoms(List.of(
                            "Increased thirst over the past 4 weeks",
                            "Frequent urination — especially at night",
                            "Fatigue and weakness in the afternoons",
                            "No hypoglycaemia (no sweating or shakiness)",
                            "Mild headache — 2–3 times per week"
                        ))
                        .physicalExamination("BP: 126/82 mmHg. Weight: 68kg (up 2kg from last visit). BMI: 29.1. RBS: 214 mg/dL. Thyroid: no goitre. No peripheral neuropathy. Feet: normal skin, normal sensation, no ulcers.")
                        .assessment("Type 2 Diabetes Mellitus — sub-optimally controlled. HbA1c 8.2% (target <7%). Dietary indiscretion and weight gain contributing. Hypothyroidism stable. Risk of diabetic nephropathy and retinopathy if control remains poor.")
                        .plan(List.of(
                            "Increase Metformin to 1000mg BD (double current dose)",
                            "Add Glipizide 5mg OD before breakfast if HbA1c not improved in 3 months",
                            "Strict dietary advice: avoid maida, sweets, fried food",
                            "Walking 45 minutes/day — aerobic exercise helps insulin sensitivity",
                            "Urine microalbumin test — kidney screening",
                            "Ophthalmology referral — annual dilated eye exam",
                            "Repeat HbA1c in 3 months"
                        ))
                        .diagnosis("Type 2 Diabetes Mellitus — sub-optimally controlled (HbA1c 8.2%). Hypothyroidism — stable. Overweight (BMI 29.1).")
                        .nextActions(List.of(
                            NextAction.builder().id("na-1").text("Take Metformin 1000mg twice daily — after breakfast and after dinner").done(false).build(),
                            NextAction.builder().id("na-2").text("Urine microalbumin test — collect sample at any nearby lab this week").done(false).build(),
                            NextAction.builder().id("na-3").text("Book an eye appointment with an ophthalmologist for dilated fundus exam").done(false).build(),
                            NextAction.builder().id("na-4").text("Walk 45 minutes every day — morning walk is best").done(false).build(),
                            NextAction.builder().id("na-5").text("Follow-up with HbA1c report in 3 months").done(false).build()
                        ))
                        .testResults(List.of(
                            TestResult.builder().name("HbA1c").value("8.2%").status("high").reference("<7.0%").date("3 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Fasting Blood Sugar").value("178 mg/dL").status("high").reference("70–100 mg/dL").date("3 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Post-Prandial Blood Sugar").value("256 mg/dL").status("high").reference("<140 mg/dL").date("3 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("TSH (Thyroid)").value("3.2 mIU/L").status("normal").reference("0.4–4.0 mIU/L").date("3 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Serum Creatinine").value("0.9 mg/dL").status("normal").reference("0.6–1.2 mg/dL").date("3 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Blood Pressure").value("126/82 mmHg").status("borderline").reference("<120/80").date("3 Mar 2026").category("Vitals").build(),
                            TestResult.builder().name("Body Weight").value("68 kg (↑2kg)").status("borderline").reference("Target: 65kg").date("3 Mar 2026").category("Vitals").build(),
                            TestResult.builder().name("Urine Microalbumin").value("Pending").status("pending").reference("<30 mg/g").date("3 Mar 2026").category("Lab").build()
                        ))
                        .medications(List.of(
                            Medication.builder()
                                .name("Metformin").dose("1000mg").frequency("Twice daily (BD)")
                                .timing("After breakfast and after dinner").duration("Long-term")
                                .purpose("To lower blood sugar by improving insulin action")
                                .sideEffects(List.of("Nausea initially", "Loose stools (usually settles in 2 weeks)", "Metallic taste"))
                                .warning("Drink plenty of water. Stop if you develop severe stomach pain.")
                                .build(),
                            Medication.builder()
                                .name("Levothyroxine").dose("50mcg").frequency("Once daily (OD)")
                                .timing("Empty stomach, 30 minutes before breakfast").duration("Long-term")
                                .purpose("To replace thyroid hormone (thyroid is underactive)")
                                .sideEffects(List.of("Palpitations if dose too high", "Weight loss (dose-related)"))
                                .warning("Take on empty stomach — dairy and iron supplements reduce absorption")
                                .build()
                        ))
                        .transcript("""
Dr. Mehta: Priya ji, aavjo. Beso. Tame kevi chho?

Priya: Thoda thak-thak laage chhe doctor. Taras bahu laage chhe.

Dr. Mehta: How is your sugar control? Have you been checking at home?

Priya: Haan, but festival ma thoda sweets khai lidha...

Dr. Mehta: I understand. But your HbA1c has gone up to 8.2 from 7.4. That tells me your average sugar over the last 3 months has been higher. Target is below 7. I'm doubling your Metformin to 1000mg twice daily.

Priya: Thyroid theek chhe?

Dr. Mehta: Thyroid is fine — TSH is normal. Continue the same Levothyroxine. Now, I want to check your kidneys and eyes. Get a urine microalbumin test this week. And see an eye doctor for a dilated fundus exam.""")
                        .build())
                    .build()
            ))
            .build(),

        // ── Patient 3: Ravi Kumar — Pulmonology ───────────────────────────────
        DemoPatientDTO.builder()
            .id("pat-003")
            .name("Ravi Kumar")
            .age(38).gender("Male").dateOfBirth("22 November 1987")
            .city("Bangalore").phone("+91-99800-XXXXX")
            .email("ravi.kumar@demo.shifa.health")
            .bloodGroup("O+").bmi(23.8)
            .initials("RK").avatarColor("#f59e0b")
            .language("Kannada").languageCode("kn")
            .specialty("pulmonology")
            .shortDescription("Asthma exacerbation after Holi celebrations. Night symptoms increasing. Controller therapy reviewed.")
            .conditions(List.of("Moderate Persistent Asthma", "Allergic Rhinitis"))
            .currentMedications(List.of("Budesonide/Formoterol Inhaler BD", "Montelukast 10mg OD", "Cetirizine 10mg OD"))
            .doctorId("doc-003")
            .visits(List.of(
                DemoVisitDTO.builder()
                    .id("visit-003-a")
                    .date("5 March 2026").dateShort("MAR 5")
                    .type("Urgent Consultation").doctorId("doc-003")
                    .summary("Ravi presents with worsening asthma — increased night cough and wheeze after Holi dust exposure. Spirometry done. Controller therapy stepped up.")
                    .quickSummary("Ravi's asthma has worsened after Holi — night cough and wheeze almost every night. Spirometry shows moderate obstruction. Controller inhaler dose increased. Action plan provided.")
                    .sections(SoapSections.builder()
                        .chiefComplaint("Worsening breathlessness, night cough, and wheeze for the past 5 days. Patient attributes onset to Holi celebrations (dust, gulal exposure).")
                        .historyOfPresentIllness("Mr. Kumar is a 38-year-old male with known moderate persistent asthma and allergic rhinitis since childhood. He reports significant worsening over the past 5 days beginning the day after Holi festival. Nocturnal cough waking him from sleep (4–5 nights/week), wheeze on exertion, reduced exercise tolerance. Using salbutamol reliever >3 times/day. Non-smoker. Software engineer. Two cats at home.")
                        .reportedSymptoms(List.of(
                            "Wheeze — audible, on exertion and at rest",
                            "Night cough — waking 4–5 nights/week from sleep",
                            "Shortness of breath on moderate exertion",
                            "Reliever inhaler use — >3 times per day (increased from baseline 0–1)",
                            "Runny nose, post-nasal drip, sneezing (allergic rhinitis flare)"
                        ))
                        .physicalExamination("RR: 18/min. SpO2: 96% on room air. Chest: bilateral expiratory wheeze on auscultation. No accessory muscle use. No cyanosis. Peak Flow: 62% predicted (baseline was 82%). Nose: swollen turbinates, clear discharge. No nasal polyps.")
                        .assessment("Moderate persistent asthma — currently in exacerbation. Triggered by Holi dust/colour particulate exposure. Allergic rhinitis co-morbidity contributing. Cats at home are a chronic allergen trigger. GINA Step 3 therapy inadequate — step up to Step 4 indicated.")
                        .plan(List.of(
                            "Step up to Budesonide/Formoterol 200/6mcg — 2 puffs BD (from 1 puff BD)",
                            "Short course: Prednisolone 30mg OD for 5 days for acute exacerbation",
                            "Continue Montelukast 10mg OD",
                            "Add Fluticasone nasal spray BD for allergic rhinitis",
                            "Salbutamol inhaler (reliever) — use only when needed, max 4 puffs/day",
                            "Asthma Action Plan provided — red/yellow/green zones explained",
                            "Consider keeping cats outside the bedroom",
                            "Pulmonary function test in 6 weeks"
                        ))
                        .diagnosis("Moderate persistent asthma — acute exacerbation (GINA Step 4). Allergic rhinitis — uncontrolled. Sensitisation to dust/pollen/cat dander likely.")
                        .nextActions(List.of(
                            NextAction.builder().id("na-1").text("Take Budesonide/Formoterol 2 puffs morning and night — rinse mouth after each use").done(false).build(),
                            NextAction.builder().id("na-2").text("Take Prednisolone 30mg tablet every morning after breakfast for 5 days").done(false).build(),
                            NextAction.builder().id("na-3").text("Use salbutamol reliever only when breathless — not as a routine puff").done(false).build(),
                            NextAction.builder().id("na-4").text("Fluticasone nasal spray — 2 sprays each nostril twice daily").done(false).build(),
                            NextAction.builder().id("na-5").text("Keep cats out of the bedroom at minimum").done(false).build(),
                            NextAction.builder().id("na-6").text("Come back in 1 week for review").done(false).build()
                        ))
                        .testResults(List.of(
                            TestResult.builder().name("SpO2").value("96%").status("borderline").reference(">97%").date("5 Mar 2026").category("Vitals").build(),
                            TestResult.builder().name("Peak Expiratory Flow").value("62% predicted").status("low").reference(">80% predicted").date("5 Mar 2026").category("Exams").build(),
                            TestResult.builder().name("Spirometry FEV1").value("68% predicted").status("low").reference(">80%").date("5 Mar 2026").category("Exams").build(),
                            TestResult.builder().name("FEV1/FVC Ratio").value("0.68").status("low").reference(">0.75").date("5 Mar 2026").category("Exams").build(),
                            TestResult.builder().name("Total IgE").value("420 IU/mL").status("high").reference("<100 IU/mL").date("5 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Absolute Eosinophil Count").value("680/μL").status("high").reference("<500/μL").date("5 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("Chest X-Ray").value("Hyperinflated lung fields. No consolidation.").status("abnormal").reference("Normal").date("5 Mar 2026").category("Exams").build()
                        ))
                        .medications(List.of(
                            Medication.builder()
                                .name("Budesonide / Formoterol").dose("200/6mcg").frequency("2 puffs twice daily (BD)")
                                .timing("Morning and night — rinse mouth after each use")
                                .duration("Long-term controller — do not stop even when feeling well")
                                .purpose("Preventive inhaler — reduces airway inflammation and opens airways. Must be used DAILY.")
                                .sideEffects(List.of("Hoarseness of voice", "Oral thrush (prevented by rinsing mouth)"))
                                .warning("This is a PREVENTER inhaler — not for immediate relief.")
                                .build(),
                            Medication.builder()
                                .name("Prednisolone").dose("30mg").frequency("Once daily for 5 days")
                                .timing("After breakfast").duration("5 days only")
                                .purpose("To quickly reduce airway inflammation during the current flare-up")
                                .sideEffects(List.of("Increased appetite", "Mild sleep disturbance", "Elevated blood sugar (temporary)"))
                                .warning("Complete the 5-day course. Do not stop early.")
                                .build(),
                            Medication.builder()
                                .name("Montelukast").dose("10mg").frequency("Once daily at night")
                                .timing("At bedtime").duration("Long-term")
                                .purpose("To control both asthma and allergic rhinitis")
                                .sideEffects(List.of("Vivid dreams", "Mood changes (rare)"))
                                .warning("Report any mood changes or unusual thoughts to doctor.")
                                .build(),
                            Medication.builder()
                                .name("Fluticasone Nasal Spray").dose("50mcg/spray").frequency("2 sprays each nostril, twice daily")
                                .timing("Morning and evening — blow nose before using")
                                .duration("4–6 weeks then review")
                                .purpose("To control nasal allergy — reduces postnasal drip which triggers cough")
                                .sideEffects(List.of("Mild nasal irritation or bleeding (rare)"))
                                .warning("Aim spray towards the outer nostril wall, not the nasal septum.")
                                .build()
                        ))
                        .transcript("""
Dr. Rao: Hello Ravi, please sit. You look a bit uncomfortable — tell me what's happening.

Ravi: Doctor, Holi aaythu — nantara nanu tumbaa kashtapaDuttideeni breathingalli. Ratri nidde baralla wheeze aagatte.

Dr. Rao: How many times are you using your reliever inhaler a day?

Ravi: 3–4 times every day now. Before it was hardly once.

Dr. Rao: That tells me your asthma is getting out of control. Your peak flow is 62% of what it should be. You're in exacerbation. The Holi gulal and dust are classic triggers. Also — you have two cats?

Ravi: Haan doctor, Tommy and Jerry. They sleep on the bed.

Dr. Rao: That's a significant allergen. I'm stepping up your controller inhaler to 2 puffs twice daily, adding a short course of steroid tablets to calm down this flare, and I want you to use the nasal spray for the rhinitis too.

Ravi: Steroid? Baadha aagattha?

Dr. Rao: It's a short course — 5 days. Very safe at this dose and duration.""")
                        .build())
                    .build()
            ))
            .build()
    );

    // ─── Lookup Maps ───────────────────────────────────────────────────────────

    public static final Map<String, DemoPatientDTO> PATIENT_MAP =
        PATIENTS.stream().collect(Collectors.toMap(DemoPatientDTO::getId, Function.identity()));

    public static final Map<String, DemoDoctorDTO> DOCTOR_MAP =
        DOCTORS.stream().collect(Collectors.toMap(DemoDoctorDTO::getId, Function.identity()));
}