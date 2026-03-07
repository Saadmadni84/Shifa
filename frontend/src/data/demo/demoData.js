export const demoPatients = [
  {
    id: 'p1',
    name: 'Rajesh Kumar',
    age: 52,
    language: 'Hindi',
    condition: 'PVCs (Palpitations) with HTN + T2DM',
    lastVitals: { bp: '148/94', sugar: '138 mg/dL' },
    profile: {
      patientUuid: '550e8400-e29b-41d4-a716-446655440001',
      dob: '15 March 1972',
      gender: 'Male',
      bloodGroup: 'B+',
      abhaId: '27-8234-7654-3219',
      phone: '+91-98765-43210',
      email: 'rajesh.kumar.demo@example.com',
      city: 'Varanasi, Uttar Pradesh',
      pincode: '221001',
      emergencyContact: 'Priya Kumar (+91-99887-76655)',
      allergies: ['Sulfonamide antibiotics (urticaria/rash)'],
      chronicConditions: ['Hypertension (controlled)', 'Type 2 Diabetes Mellitus (well-controlled)'],
      currentMeds: ['Telmisartan 40mg OD', 'Metformin 500mg BD']
    },
    visits: [
      {
        id: 'visit-00-pvcs-palpitations',
        date: '2026-03-05',
        diagnosis: 'Premature Ventricular Contractions (I49.3) - benign',
        advice: 'Start Metoprolol 25mg OD, continue Telmisartan + Metformin, monitor BP daily, limit caffeine.',
        aiStatus: 'Hindi summary sent via WhatsApp (Delivered)',
        scenarioId: 'visit-00-pvcs-palpitations',
        domain: 'Cardiology',
        chiefComplaint: 'Palpitations / fluttering sensation in chest x 3 weeks',
        visitStatus: 'SENT_TO_PATIENT',
        whatsappStatus: 'DELIVERED',
        followUpDate: '2026-04-02',
        portalToken: 'pvcs-rajesh-demo-tk001',
        portalUrl: 'https://shifa.health/portal/pvcs-rajesh-demo-tk001',
        doctor: {
          name: 'Dr. Ananya Sharma',
          title: 'Interventional Cardiologist',
          clinic: 'Sharma Heart & Diabetes Clinic',
          clinicPhone: '+91-542-235-8900',
          registrationNumber: 'UP-MED-2004-12847'
        },
        vitalsDetailed: [
          { name: 'Blood Pressure', reading: '148 / 94 mmHg', status: 'Elevated' },
          { name: 'Pulse Rate', reading: '82 bpm (irregular)', status: 'Irregular' },
          { name: 'Temperature', reading: '36.8 C', status: 'Normal' },
          { name: 'SpO2', reading: '97%', status: 'Normal' },
          { name: 'Respiratory Rate', reading: '17 / min', status: 'Normal' },
          { name: 'Weight / Height', reading: '78 kg / 172 cm', status: 'Recorded' },
          { name: 'BMI', reading: '26.4 kg/m2', status: 'Overweight' },
          { name: 'Blood Sugar (RBS)', reading: '138 mg/dL', status: 'Borderline' }
        ],
        prescription: [
          {
            medicine: 'Metoprolol Succinate 25mg (Betaloc ZOK)',
            dose: '25mg',
            frequency: 'Once daily',
            timing: 'After breakfast',
            duration: '30 days',
            purpose: 'PVC suppression + BP control',
            critical: true
          },
          {
            medicine: 'Telmisartan 40mg (Telma)',
            dose: '40mg',
            frequency: 'Once daily',
            timing: 'Morning',
            duration: 'Continue',
            purpose: 'Blood pressure control',
            critical: true
          },
          {
            medicine: 'Metformin 500mg (Glycomet)',
            dose: '500mg',
            frequency: 'Twice daily',
            timing: 'With meals',
            duration: 'Continue',
            purpose: 'Blood sugar control',
            critical: true
          },
          {
            medicine: 'Potassium Chloride 600mg (Span-K)',
            dose: '600mg',
            frequency: 'Twice daily',
            timing: 'After meals',
            duration: '15 days',
            purpose: 'Electrolyte support',
            critical: false
          },
          {
            medicine: 'Omega-3 FA 1000mg (Maxepa)',
            dose: '1000mg',
            frequency: 'Once daily',
            timing: 'After lunch',
            duration: '90 days',
            purpose: 'Cardiac health support',
            critical: false
          }
        ],
        rawDoctorNotes: `CC: Palpitations / fluttering in chest x 3 weeks.
Worse at night and during stress. No syncope. No chest pain. No SOB at rest.

PMH: HTN (on Telmisartan 40), T2DM (on Metformin 500 BD),
NKDA except sulfonamides (urticaria).

Examination: Irregular pulse, HR 82/min, BP 148/94, SpO2 97%, RR 17,
Temp 36.8C, Wt 78kg, Ht 172cm. CVS: S1 S2 heard, no murmurs.

Ix done today:
- ECG: occasional PVCs, no ischaemia
- Echo: normal LV function, EF 62%
- Holter 24hr: 2300 PVCs/day, unifocal, no NSVT
- TSH normal. Electrolytes normal. RBS 138.

Dx: Symptomatic PVCs, benign, structurally normal heart.
Suboptimal BP control (HTN). T2DM stable.

FU: 4 weeks (2 April 2026). Repeat Holter in 3 months.`,
        aiSummary: {
          en: `YOUR VISIT SUMMARY - Dr. Ananya Sharma | 5 March 2026

Your heart produces occasional extra beats called PVCs. Heart structure is normal (EF 62%). These beats are benign but uncomfortable.

Your BP is high today (148/94), so monitor at home morning and evening.

Emergency signs: chest pain, fainting, continuous palpitations >10 min, breathlessness at rest.`,
          hi: `आपकी विजिट का सारांश - डॉ. अनन्या शर्मा | 5 मार्च 2026

आपके दिल में कभी-कभी अतिरिक्त धड़कन आती है, जिसे PVC कहते हैं। दिल की बनावट सामान्य है (EF 62%)। यह हानिरहित है, लेकिन असुविधा दे सकती है।

आज BP 148/94 है, इसलिए सुबह-शाम घर पर BP मापकर डायरी में लिखें।

खतरे के संकेत: सीने में दर्द, बेहोशी, 10 मिनट से ज्यादा धड़कन, आराम में सांस फूलना।`
        },
        whatsappMessage: `नमस्ते राजेश जी! डॉ. अनन्या शर्मा की क्लिनिक से आपकी विजिट का सारांश आया है।
मुख्य बातें: PVCs हानिरहित हैं, दिल सामान्य है। BP थोड़ा अधिक है।
नई दवा: मेटोप्रोलोल 25mg - हर सुबह नाश्ते के बाद।
पूरा सारांश: https://shifa.health/portal/pvcs-rajesh-demo-tk001`
      }
    ]
  },
  {
    id: 'p2',
    name: 'Aisha Sharma',
    age: 32,
    language: 'English',
    condition: 'Hypertension',
    lastVitals: { bp: '145/90', sugar: '95 mg/dL' },
    visits: [
      { id: 'v2', date: '2024-03-01', diagnosis: 'High Blood Pressure', advice: 'Start Amlodipine 5mg, monitor BP daily.', aiStatus: 'Sent via WhatsApp' }
    ]
  },
  {
    id: 'p3',
    name: 'Manoj Desai',
    age: 58,
    language: 'Marathi',
    condition: 'General Weakness',
    lastVitals: { bp: '120/80', sugar: '105 mg/dL' },
    visits: [
      { id: 'v3', date: '2024-02-28', diagnosis: 'Viral Fever', advice: 'Rest, Paracetamol 500mg, plenty of fluids.', aiStatus: 'Sent via WhatsApp' }
    ]
  }
];

export const demoDoctors = [
  {
    id: 'd1',
    name: 'Dr. Ananya Sharma',
    specialty: 'Interventional Cardiologist',
    patientsToday: 10,
    pendingAI: 1
  },
  {
    id: 'd2',
    name: 'Dr. Vikram Singh',
    specialty: 'Cardiologist',
    patientsToday: 8,
    pendingAI: 0
  },
  {
    id: 'd3',
    name: 'Dr. Sneha Patel',
    specialty: 'General Physician',
    patientsToday: 20,
    pendingAI: 5
  }
];