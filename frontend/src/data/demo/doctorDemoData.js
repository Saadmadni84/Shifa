// ─────────────────────────────────────────────────────────────
//  Shifa — Doctor Demo Data (Indian patients, realistic context)
// ─────────────────────────────────────────────────────────────

export const DEMO_DOCTOR = {
  id: "d1",
  name: "Dr. Priya Sharma",
  specialty: "General Physician & Diabetologist",
  hospital: "Apollo Clinic, Prayagraj",
  avatar: "PS",
  phone: "+91-9876543210",
};

export const DEMO_PATIENTS = [
  {
    id: "p1",
    firstName: "Rajesh",
    lastName: "Kumar",
    age: 52,
    dob: "1972-04-10",
    gender: "Male",
    language: "hi",
    languageLabel: "Hindi",
    phone: "+91-9812345678",
    avatar: "RK",
    alertStatus: "alert",
    primaryCondition: "Premature Ventricular Contractions (I49.3)",
    lastVisitDate: "2026-03-05",
    lastVitals: { bp: "148/94", sugar: "138 mg/dL", weight: "78 kg", pulse: "82 bpm" },
    unreadCount: 3,
    activeConditions: [
      { code: "I49.3", display: "Premature Ventricular Contractions", status: "active" },
      { code: "I10", display: "Hypertension", status: "active" },
      { code: "E11", display: "Type 2 Diabetes Mellitus", status: "active" },
    ],
    activeMedications: [
      { name: "Metoprolol", dose: "25 mg", frequency: "Once daily (OD)", timing: "Morning" },
      { name: "Telmisartan", dose: "40 mg", frequency: "Once daily (OD)", timing: "Morning" },
      { name: "Metformin", dose: "500 mg", frequency: "Twice daily (BD)", timing: "After meals" },
    ],
    whatsappDeliveryStatus: "Delivered",
    summaryLanguage: "Hindi",
  },
  {
    id: "p2",
    firstName: "Aisha",
    lastName: "Sharma",
    age: 45,
    dob: "1980-08-22",
    gender: "Female",
    language: "hi",
    languageLabel: "Hindi",
    phone: "+91-9823456789",
    avatar: "AS",
    alertStatus: "review",
    primaryCondition: "Hypothyroidism (E03.9)",
    lastVisitDate: "2026-02-28",
    lastVitals: { bp: "126/82", sugar: "112 mg/dL", weight: "68 kg", pulse: "72 bpm" },
    unreadCount: 1,
    activeConditions: [
      { code: "E03.9", display: "Hypothyroidism, unspecified", status: "active" },
      { code: "M79.3", display: "Chronic Fatigue", status: "active" },
    ],
    activeMedications: [
      { name: "Levothyroxine", dose: "50 mcg", frequency: "Once daily (OD)", timing: "Empty stomach, morning" },
    ],
    whatsappDeliveryStatus: "Read",
    summaryLanguage: "Hindi",
  },
  {
    id: "p3",
    firstName: "Manoj",
    lastName: "Desai",
    age: 61,
    dob: "1964-11-05",
    gender: "Male",
    language: "ur",
    languageLabel: "Urdu",
    phone: "+91-9834567890",
    avatar: "MD",
    alertStatus: "alert",
    primaryCondition: "Chronic Obstructive Pulmonary Disease (J44.1)",
    lastVisitDate: "2026-03-01",
    lastVitals: { bp: "158/96", sugar: "165 mg/dL", weight: "71 kg", pulse: "94 bpm" },
    unreadCount: 5,
    activeConditions: [
      { code: "J44.1", display: "COPD with acute exacerbation", status: "active" },
      { code: "E11", display: "Type 2 Diabetes Mellitus", status: "active" },
      { code: "I10", display: "Hypertension", status: "active" },
    ],
    activeMedications: [
      { name: "Tiotropium Inhaler", dose: "18 mcg", frequency: "Once daily (OD)", timing: "Morning" },
      { name: "Salbutamol Inhaler", dose: "100 mcg", frequency: "As needed (SOS)", timing: "On breathlessness" },
      { name: "Amlodipine", dose: "5 mg", frequency: "Once daily (OD)", timing: "Evening" },
    ],
    whatsappDeliveryStatus: "Delivered",
    summaryLanguage: "Urdu",
  },
];

export const DEMO_VISITS = {
  p1: [
    {
      id: "v1-1",
      patientId: "p1",
      date: "2026-03-05",
      type: "Follow-up",
      doctor: "Dr. Priya Sharma",
      diagnosis: "Premature Ventricular Contractions (I49.3) — benign",
      chiefComplaint: "Palpitations, occasional dizziness",
      clinicalNotes:
        "Patient reports intermittent palpitations over past 2 weeks. ECG shows occasional PVCs. BP elevated at 148/94. Blood sugar 138 mg/dL (fasting). No chest pain, no syncope. Lungs clear.",
      instructions:
        "Start Metoprolol 25mg OD, continue Telmisartan + Metformin, monitor BP daily, limit caffeine. Return in 4 weeks or earlier if palpitations worsen. Avoid strenuous exercise.",
      prescriptions: [
        { name: "Tab. Metoprolol 25mg", sig: "1-0-0 (After breakfast)", duration: "30 days", refills: 1 },
        { name: "Tab. Telmisartan 40mg", sig: "1-0-0 (Before breakfast)", duration: "30 days", refills: 2 },
        { name: "Tab. Metformin 500mg", sig: "1-0-1 (After meals)", duration: "30 days", refills: 2 },
      ],
      whatsappSummary: {
        sent: true,
        language: "Hindi",
        status: "Delivered",
        timestamp: "2026-03-05T11:42:00",
        preview:
          "नमस्ते राजेश जी! आपकी आज की जाँच के बाद डॉ. प्रिया शर्मा की ओर से:\n\n✅ निदान: दिल में छोटे-छोटे अनियमित धड़कन (PVCs) — घबराने की बात नहीं\n\n💊 दवाइयाँ:\n1. मेटोप्रोलोल 25mg — सुबह नाश्ते के बाद\n2. टेल्मिसार्टन 40mg — सुबह खाली पेट\n3. मेटफॉर्मिन 500mg — सुबह-शाम खाने के बाद\n\n⚠️ ध्यान दें: चाय/कॉफी कम करें, BP रोज नापें।\n\n📅 अगली मुलाक़ात: 4 हफ्ते बाद",
      },
      vitals: { bp: "148/94", pulse: "82", weight: "78", sugar: "138" },
      followUpDate: "2026-04-02",
    },
    {
      id: "v1-2",
      patientId: "p1",
      date: "2026-02-10",
      type: "Consultation",
      doctor: "Dr. Priya Sharma",
      diagnosis: "Hypertension Stage 2, Type 2 Diabetes (uncontrolled)",
      chiefComplaint: "Headache, fatigue",
      clinicalNotes:
        "BP 156/98 on two readings. HbA1c 8.2%. Patient non-compliant with diet. Advised lifestyle changes.",
      instructions: "Continue Telmisartan. Add Metformin. Low-salt diet, reduce sugar intake. Follow up in 4 weeks.",
      prescriptions: [
        { name: "Tab. Telmisartan 40mg", sig: "1-0-0", duration: "30 days", refills: 2 },
        { name: "Tab. Metformin 500mg", sig: "1-0-1", duration: "30 days", refills: 2 },
      ],
      whatsappSummary: { sent: true, language: "Hindi", status: "Read", timestamp: "2026-02-10T10:15:00" },
      vitals: { bp: "156/98", pulse: "88", weight: "79", sugar: "162" },
      followUpDate: "2026-03-05",
    },
  ],
  p2: [
    {
      id: "v2-1",
      patientId: "p2",
      date: "2026-02-28",
      type: "Follow-up",
      doctor: "Dr. Priya Sharma",
      diagnosis: "Hypothyroidism — suboptimal control",
      chiefComplaint: "Tiredness, weight gain, cold intolerance",
      clinicalNotes:
        "TSH 7.2 mIU/L (high). Currently on Levothyroxine 25mcg. Dose increased to 50mcg. Advise recheck TSH in 6 weeks.",
      instructions: "Increase Levothyroxine to 50mcg. Take on empty stomach 30 min before breakfast. Recheck TSH after 6 weeks.",
      prescriptions: [
        { name: "Tab. Levothyroxine 50mcg", sig: "1-0-0 (Empty stomach)", duration: "45 days", refills: 1 },
      ],
      whatsappSummary: { sent: true, language: "Hindi", status: "Read", timestamp: "2026-02-28T09:30:00" },
      vitals: { bp: "126/82", pulse: "72", weight: "68", sugar: "112" },
      followUpDate: "2026-04-10",
    },
  ],
  p3: [
    {
      id: "v3-1",
      patientId: "p3",
      date: "2026-03-01",
      type: "Emergency OPD",
      doctor: "Dr. Priya Sharma",
      diagnosis: "COPD Acute Exacerbation (J44.1) with uncontrolled Diabetes",
      chiefComplaint: "Increased breathlessness, cough with yellow sputum",
      clinicalNotes:
        "SpO2 94% on room air. Chest X-ray shows hyperinflation. BP 158/96. Sugar 165 mg/dL. Sputum sent for culture. Started on nebulization.",
      instructions: "Tiotropium inhaler daily. Salbutamol as needed. Course of Azithromycin 3 days. Monitor SpO2. Return immediately if SpO2 drops below 92%.",
      prescriptions: [
        { name: "Tiotropium Inhaler 18mcg", sig: "2 puffs OD (Morning)", duration: "30 days", refills: 2 },
        { name: "Salbutamol Inhaler 100mcg", sig: "2 puffs SOS", duration: "30 days", refills: 1 },
        { name: "Tab. Azithromycin 500mg", sig: "1-0-0", duration: "3 days", refills: 0 },
      ],
      whatsappSummary: { sent: true, language: "Urdu", status: "Delivered", timestamp: "2026-03-01T15:00:00" },
      vitals: { bp: "158/96", pulse: "94", weight: "71", sugar: "165", spo2: "94%" },
      followUpDate: "2026-03-08",
    },
  ],
};

export const DASHBOARD_STATS = {
  totalPatients: DEMO_PATIENTS.length,
  unreadMessages: DEMO_PATIENTS.reduce((sum, p) => sum + p.unreadCount, 0),
  totalVisits: Object.values(DEMO_VISITS).flat().length,
  alertPatients: DEMO_PATIENTS.filter((p) => p.alertStatus === "alert").length,
};

export const ALERTS = DEMO_PATIENTS.filter((p) => p.alertStatus === "alert").map((p) => ({
  patientId: p.id,
  patientName: `${p.firstName} ${p.lastName}`,
  type: p.primaryCondition.split("(")[0].trim(),
  detail: `Last BP: ${p.lastVitals.bp} | Last Sugar: ${p.lastVitals.sugar}`,
  date: p.lastVisitDate,
  avatar: p.avatar,
}));

