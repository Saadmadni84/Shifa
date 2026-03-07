package com.shifa.demo.data;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.shifa.demo.dto.DemoDoctorDTO;
import com.shifa.demo.dto.DemoPatientDTO;
import com.shifa.demo.dto.DemoVisitDTO;
import com.shifa.demo.dto.DemoVisitDTO.Medication;
import com.shifa.demo.dto.DemoVisitDTO.NextAction;
import com.shifa.demo.dto.DemoVisitDTO.SoapSections;
import com.shifa.demo.dto.DemoVisitDTO.TestResult;

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
 *   pat-001 — Rajesh Kumar     — Cardiology  — PVCs          — Hindi
 *   pat-002 — Priya Patel      — Diabetes    — HbA1c 8.2%    — Gujarati
 *   pat-003 — Ravi Kumar       — Pulmonology — Asthma flare  — Kannada
 *
 * Doctors:
 *   doc-001 — Dr. Ananya Sharma     — Cardiologist    — Varanasi
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
            .name("Dr. Ananya Sharma")
            .specialty("Interventional Cardiology")
            .qualifications("MBBS, MD (Medicine), DM (Cardiology)")
            .hospital("Sharma Heart & Diabetes Clinic, Varanasi")
            .phone("+91-542-235-8900")
            .email("ananya.sharma@demo.shifa.health")
            .initials("AS")
            .color("#10b981")
            .patientIds(List.of("pat-001"))
            .stats(DemoDoctorDTO.DoctorStats.builder()
                .totalPatients(64).visitsThisWeek(21).pendingReports(4).newMessages(6).build())
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

        // ── Patient 1: Rajesh Kumar — Cardiology (PVCs) ───────────────────────
        DemoPatientDTO.builder()
            .id("pat-001")
            .name("Rajesh Kumar")
            .age(52).gender("Male").dateOfBirth("15 March 1972")
            .city("Varanasi").phone("+91-98765-43210")
            .email("rajesh.kumar.demo@example.com")
            .bloodGroup("B+").bmi(26.4)
            .initials("RK").avatarColor("#10b981")
            .language("Hindi").languageCode("hi")
            .specialty("cardiology")
            .shortDescription("Palpitations for 3 weeks. Diagnosed with benign symptomatic PVCs with structurally normal heart.")
            .conditions(List.of(
                "Premature Ventricular Contractions (PVCs) - ICD-10 I49.3",
                "Hypertension (controlled)",
                "Type 2 Diabetes Mellitus (well-controlled)",
                "Allergy: Sulfonamide antibiotics (urticaria)"
            ))
            .currentMedications(List.of(
                "Metoprolol Succinate 25mg OD",
                "Telmisartan 40mg OD",
                "Metformin 500mg BD",
                "Potassium Chloride 600mg BD (15 days)",
                "Omega-3 FA 1000mg OD"
            ))
            .doctorId("doc-001")
            .visits(List.of(
                DemoVisitDTO.builder()
                    .id("visit-00-pvcs-palpitations")
                    .date("5 March 2026").dateShort("MAR 5")
                    .type("IN_PERSON").doctorId("doc-001")
                    .summary("Symptomatic PVCs on ECG/Holter with structurally normal heart (EF 62%). BP elevated at 148/94. Hindi patient summary and WhatsApp delivery completed.")
                    .quickSummary("Rajesh ji ko 3 hafte se palpitations hain. Diagnosis: benign PVCs. Heart structure normal hai; BP monitoring daily zaruri hai.")
                    .sections(SoapSections.builder()
                        .chiefComplaint("Palpitations/fluttering sensation in chest for 3 weeks, worse at night and during stress.")
                        .historyOfPresentIllness("Mr. Rajesh Kumar, 52-year-old male with hypertension and Type 2 diabetes, reports fluttering/skipping beats in chest for 3 weeks. No syncope, no chest pain, and no shortness of breath at rest. ECG shows occasional PVCs without ischemia. Prior Holter shows 2300 unifocal PVCs/day with no NSVT. Echo confirms structurally normal heart with EF 62%.")
                        .reportedSymptoms(List.of(
                            "Palpitations/fluttering sensation in chest",
                            "Symptoms worse at night and stress",
                            "No syncope or presyncope",
                            "No chest pain",
                            "No breathlessness at rest"
                        ))
                        .physicalExamination("BP 148/94 mmHg; pulse 82/min irregular; SpO2 97%; RR 17/min; temperature 36.8 C; weight 78kg; height 172cm; BMI 26.4. CVS: S1 S2 heard, no murmurs. JVP normal. Chest clear. No pedal edema.")
                        .assessment("Symptomatic benign Premature Ventricular Contractions (PVCs) with structurally normal heart (EF 62%). Suboptimal blood pressure control in known hypertension. Type 2 diabetes currently stable. Sulfonamide allergy noted for medication safety.")
                        .plan(List.of(
                            "Start Metoprolol Succinate 25mg once daily after breakfast for 30 days",
                            "Continue Telmisartan 40mg once daily (morning)",
                            "Continue Metformin 500mg twice daily with meals",
                            "Add Potassium Chloride 600mg twice daily after meals for 15 days",
                            "Add Omega-3 fatty acid 1000mg once daily after lunch for 90 days",
                            "Caffeine limit: max 1 cup tea/coffee daily",
                            "Home BP monitoring morning and evening with diary",
                            "Daily brisk walk/yoga 30 minutes; avoid heavy gym/weight lifting",
                            "Follow-up on 2 April 2026; repeat Holter in 3 months"
                        ))
                        .diagnosis("Premature Ventricular Contractions (PVCs) - benign, symptomatic, structurally normal heart (ICD-10: I49.3)")
                        .nextActions(List.of(
                            NextAction.builder().id("na-1").text("Metoprolol 25mg subah naste ke baad roz lein; bina salah achanak band na karein").done(false).build(),
                            NextAction.builder().id("na-2").text("BP diary: roz subah aur sham reading likhein").done(false).build(),
                            NextAction.builder().id("na-3").text("Emergency red flags (chest pain, fainting, >10 min palpitations, breathlessness) par turant ER jayein").done(false).build(),
                            NextAction.builder().id("na-4").text("Follow-up visit: 2 April 2026").done(false).build()
                        ))
                        .testResults(List.of(
                            TestResult.builder().name("Blood Pressure").value("148/94 mmHg").status("high").reference("<130/80 mmHg").date("5 Mar 2026").category("Vitals").build(),
                            TestResult.builder().name("Pulse Rate").value("82 bpm (irregular)").status("abnormal").reference("60-100 bpm regular").date("5 Mar 2026").category("Vitals").build(),
                            TestResult.builder().name("SpO2").value("97%").status("normal").reference("95-100%").date("5 Mar 2026").category("Vitals").build(),
                            TestResult.builder().name("Random Blood Sugar").value("138 mg/dL").status("borderline").reference("<140 mg/dL").date("5 Mar 2026").category("Lab").build(),
                            TestResult.builder().name("12-Lead ECG").value("Occasional PVCs, no ischemia").status("abnormal").reference("No ventricular ectopy").date("5 Mar 2026").category("Exams").build(),
                            TestResult.builder().name("Echocardiography").value("Normal LV function, EF 62%").status("normal").reference("EF >55%").date("5 Mar 2026").category("Exams").build(),
                            TestResult.builder().name("Holter 24hr").value("2300 PVCs/day, unifocal, no NSVT").status("abnormal").reference("Low ectopy burden").date("Feb 2026").category("Exams").build(),
                            TestResult.builder().name("TSH and Electrolytes").value("Within normal range").status("normal").reference("Normal").date("5 Mar 2026").category("Lab").build()
                        ))
                        .medications(List.of(
                            Medication.builder()
                                .name("Metoprolol Succinate (Betaloc ZOK)").dose("25mg").frequency("Once daily")
                                .timing("After breakfast").duration("30 days")
                                .purpose("PVC suppression and blood pressure control")
                                .sideEffects(List.of("Dizziness on standing", "Fatigue in first week", "Slow pulse"))
                                .warning("Critical medicine: do not stop suddenly without doctor advice")
                                .build(),
                            Medication.builder()
                                .name("Telmisartan (Telma)").dose("40mg").frequency("Once daily")
                                .timing("Morning").duration("Continue")
                                .purpose("Blood pressure control")
                                .sideEffects(List.of("Lightheadedness", "Rare dry cough", "Fatigue"))
                                .warning("Critical medicine: continue daily and monitor home BP")
                                .build(),
                            Medication.builder()
                                .name("Metformin (Glycomet)").dose("500mg").frequency("Twice daily")
                                .timing("With meals").duration("Continue")
                                .purpose("Type 2 diabetes control")
                                .sideEffects(List.of("Mild gastric upset", "Bloating", "Loose stools in first few days"))
                                .warning("Critical medicine: continue regularly with food")
                                .build(),
                            Medication.builder()
                                .name("Potassium Chloride (Span-K)").dose("600mg").frequency("Twice daily")
                                .timing("After meals").duration("15 days")
                                .purpose("Electrolyte support; low potassium can worsen PVCs")
                                .sideEffects(List.of("Mild nausea", "Abdominal discomfort"))
                                .warning("Take after meals; do not crush extended-release tablet")
                                .build(),
                            Medication.builder()
                                .name("Omega-3 FA (Maxepa)").dose("1000mg").frequency("Once daily")
                                .timing("After lunch").duration("90 days")
                                .purpose("Cardiac health support")
                                .sideEffects(List.of("Fishy aftertaste", "Mild bloating"))
                                .warning("Supportive medicine; continue lifestyle changes as primary therapy")
                                .build()
                        ))
                        .transcript("""
Dr. Ananya Sharma: Namaste Rajesh ji, kya dikkat hai?

Rajesh: 3 hafte se seene mein fluttering jaisi feeling hai, raat mein zyada hoti hai.

Dr. Sharma: Chakkar, behoshi, chest pain ya rest mein saans phoolna hua?

Rajesh: Nahi, behoshi ya chest pain nahi hua.

Dr. Sharma: ECG mein occasional PVCs hain. Echo normal hai, EF 62%. Holter mein unifocal PVCs aaye hain, par dangerous pattern nahi hai.

Rajesh: Matlab serious nahi hai?

Dr. Sharma: Nahi, structurally heart normal hai. PVCs uncomfortable hain par benign hain. Aapko Metoprolol shuru karte hain aur BP diary maintain karni hai.

Rajesh: Theek hai doctor, kya avoid karna hai?

Dr. Sharma: Chai-coffee ek cup se zyada nahi. Daily 30 min walk ya yoga. Agar chest pain, behoshi, 10 minute se zyada palpitations, ya breathlessness ho to turant emergency.
""")
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