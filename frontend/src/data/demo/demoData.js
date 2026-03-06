export const demoPatients = [
  {
    id: 'p1',
    name: 'Rajesh Kumar',
    age: 45,
    language: 'Hindi',
    condition: 'Type 2 Diabetes',
    lastVitals: { bp: '130/85', sugar: '160 mg/dL' },
    visits: [
      { id: 'v1', date: '2024-03-05', diagnosis: 'Routine Checkup', advice: 'Continue Metformin, reduce sugar intake.', aiStatus: 'Sent via WhatsApp' }
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
    name: 'Dr. Anita Desai',
    specialty: 'Endocrinologist',
    patientsToday: 12,
    pendingAI: 2
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