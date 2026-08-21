/**
 * DemoPatientView.jsx — Patient Panel (Demo Mode)
 * src/pages/demo/DemoPatientView.jsx
 *
 * Route: /demo/patient/:id
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Monitor, ChevronRight, ChevronLeft, FileText, BookOpen,
  Calendar, X, Send, Plus, Maximize2, Minimize2, User, Heart,
  Mic, MicOff, Circle, ExternalLink, Loader2, Activity,
  Pill, Clock, Link2, FolderOpen, Watch, FlaskConical, Pencil
} from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'

// ─── SCENARIO DATA ────────────────────────────────────────────────────────────
const SCENARIOS = {
  'pat-001': {
    id: 'pat-001', name: 'Arjun Sharma', age: 33, gender: 'Male',
    dob: 'March 12, 1972', phone: '+91-98765-43210', mrn: 'MRN-001',
    email: 'arjun.sharma.pvc@demo.shifa.health',
    bloodType: 'B+', height: 172, weight: 74, bmi: 25.0,
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContact: { name: 'Sunita Sharma', relation: 'Spouse', phone: '+91-98765-43211' },
    language: 'Hindi', specialty: 'Cardiology',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    doctor: { name: 'Dr. Ananya Krishnan', specialty: 'Cardiology', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    visits: [{
      id: 'v1', date: 'JUN 28', type: 'Office Visit',
      diagnosis: 'Premature Ventricular Contractions (PVCs)',
      diagnosisSince: 'June 18, 2026', severity: 'moderate', status: 'active',
      notes: 'Heart palpitations and irregular heartbeat for 3 weeks. EKG shows PVCs. Started on Propranolol 40mg BID.',
      medications: [{ name: 'Propranolol 40mg', freq: 'Twice daily with meals', notes: 'Do not stop abruptly. Monitor HR.' }],
      vitals: { bp: '128/82', hr: '78 bpm', weight: '74 kg', spo2: '99%' },
      followUp: '2 weeks for BP check and medication tolerance',
      redFlags: ['Chest pain or pressure', 'Fainting or near-fainting', 'Palpitations lasting > 30 min'],
      instructions: ['Reduce caffeine to 1 cup/day', 'Regular exercise, stress management', 'Weigh yourself daily'],
    }],
    vitalsData: {
      device: 'Apple Watch Series 9', lastSync: 'Jul 9, 04:00 AM',
      summary: { restingHR: 72, pvcEvents: 5, steps: 8420, hrv: 40, sleep: 6.9, spo2: 98 },
      hrTrend: [
        { date: 'Jul 2', bpm: 81 }, { date: 'Jul 3', bpm: 79 }, { date: 'Jul 4', bpm: 84 },
        { date: 'Jul 5', bpm: 80 }, { date: 'Jul 6', bpm: 80 }, { date: 'Jul 7', bpm: 77 },
        { date: 'Jul 8', bpm: 80 }, { date: 'Jul 9', bpm: 60 },
      ],
      weightTrend: [
        { date: 'Jun 10', kg: 80.0, delta: '+0.3' }, { date: 'Jun 11', kg: 80.1, delta: '+0.1' },
        { date: 'Jun 12', kg: 80.0, delta: '0.0' }, { date: 'Jun 13', kg: 79.9, delta: '-0.1' },
        { date: 'Jun 18', kg: 80.5, delta: '+0.5' }, { date: 'Jun 20', kg: 80.2, delta: '-0.2' },
        { date: 'Jun 22', kg: 80.7, delta: '+0.5' }, { date: 'Jun 23', kg: 80.4, delta: '-0.3' },
        { date: 'Jun 27', kg: 80.7, delta: '+0.3' }, { date: 'Jun 28', kg: 81.0, delta: '+0.2' },
        { date: 'Jun 29', kg: 81.5, delta: '+0.5' }, { date: 'Jul 1', kg: 81.7, delta: '+0.2' },
        { date: 'Jul 4', kg: 82.0, delta: '+0.3' }, { date: 'Jul 6', kg: 82.3, delta: '+0.3' },
        { date: 'Jul 7', kg: 83.6, delta: '+1.3' }, { date: 'Jul 8', kg: 85.1, delta: '+1.5' },
      ],
      bpTrend: [{ date: 'Jul 8', sys: 128, dia: 82 }],
    },
    labResults: [
      { date: 'Jul 8, 2026', name: 'Total Cholesterol', value: 215, unit: 'mg/dL', status: 'high',
        desirable: '<200 mg/dL', refLow: null, refHigh: 200,
        history: [{ date: 'Jan 9', v: 302 }, { date: 'Mar 9', v: 270 }, { date: 'May 9', v: 245 }, { date: 'Jul 8', v: 215 }] },
      { date: 'Jul 8, 2026', name: 'Potassium', value: 4.1, unit: 'mEq/L', status: 'normal',
        desirable: '3.5–5.0 mEq/L', refLow: 3.5, refHigh: 5.0,
        history: [{ date: 'Jan 9', v: 4.1 }, { date: 'Mar 9', v: 4.0 }, { date: 'May 9', v: 4.15 }, { date: 'Jul 8', v: 4.1 }] },
      { date: 'Jun 28, 2026', name: 'EKG', value: null, unit: '', status: 'abnormal',
        desirable: 'Normal sinus rhythm', refLow: null, refHigh: null,
        history: [], note: 'Frequent PVCs, no ST-segment changes' },
      { date: 'Jun 15, 2026', name: 'LDL Cholesterol', value: 118, unit: 'mg/dL', status: 'borderline',
        desirable: '<100 mg/dL optimal', refLow: null, refHigh: 100,
        history: [{ date: 'Jan 9', v: 178 }, { date: 'Mar 9', v: 152 }, { date: 'May 9', v: 134 }, { date: 'Jun 15', v: 118 }] },
    ],
    references: [
      { title: 'Understanding PVCs (Heart Palpitations)', url: '#', type: 'Article' },
      { title: 'Propranolol — Patient Guide', url: '#', type: 'Medication' },
      { title: 'Heart-Healthy Diet for Cardiac Patients', url: '#', type: 'Diet' },
      { title: 'Stress & Heart Health — What You Should Know', url: '#', type: 'Article' },
      { title: 'When to Call Your Doctor (Cardiac Symptoms)', url: '#', type: 'Emergency' },
    ],
    contextPrompt: `Patient: Arjun Sharma, 52M. Diagnosis: Premature Ventricular Contractions (PVCs).
Medication: Propranolol 40mg BID. Instructions: reduce caffeine, regular exercise, stress management.
Follow-up in 2 weeks. Red flags: chest pain, fainting, prolonged palpitations.
Doctor: Dr. Ananya Krishnan, Cardiologist.`,
  },
  'pat-002': {
    id: 'pat-002', name: 'Priya Patel', age: 26, gender: 'Female',
    dob: 'August 5, 1979', phone: '+91-99887-76655', mrn: 'MRN-002',
    email: 'priya.patel.diabetes@demo.shifa.health',
    bloodType: 'A+', height: 158, weight: 68, bmi: 27.2,
    allergies: ['Aspirin'],
    emergencyContact: { name: 'Rajesh Patel', relation: 'Spouse', phone: '+91-99887-76656' },
    language: 'Gujarati', specialty: 'Endocrinology',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    doctor: { name: 'Dr. Suresh Mehta', specialty: 'Endocrinology', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
    visits: [{
      id: 'v1', date: 'JUN 27', type: 'Office Visit',
      diagnosis: 'Type 2 Diabetes Mellitus — Poorly Controlled',
      diagnosisSince: 'January 10, 2024', severity: 'moderate', status: 'active',
      notes: 'HbA1c elevated at 8.2%. Metformin dose increased to 1000mg BD. Dietary counselling provided.',
      medications: [
        { name: 'Metformin 1000mg', freq: 'Twice daily with meals', notes: 'Take with food to reduce GI side effects.' },
        { name: 'Glimepiride 2mg', freq: 'Once daily before breakfast', notes: 'Monitor for hypoglycaemia.' },
      ],
      vitals: { bp: '132/84', hr: '74 bpm', weight: '68 kg', spo2: '98%' },
      followUp: '3 months for repeat HbA1c',
      redFlags: ['Blood sugar < 70 mg/dL', 'Blood sugar > 300 mg/dL', 'Nausea, vomiting, abdominal pain'],
      instructions: ['Low GI diet — avoid refined carbs', 'Walk 30 minutes after each meal', 'Check fasting blood sugar daily'],
    }],
    vitalsData: {
      device: 'Glucometer + BP Monitor', lastSync: 'Jul 9, 08:00 AM',
      summary: { restingHR: 74, pvcEvents: 0, steps: 6200, hrv: 35, sleep: 7.2, spo2: 98 },
      hrTrend: [
        { date: 'Jul 2', bpm: 76 }, { date: 'Jul 3', bpm: 74 }, { date: 'Jul 4', bpm: 78 },
        { date: 'Jul 5', bpm: 73 }, { date: 'Jul 6', bpm: 75 }, { date: 'Jul 7', bpm: 72 },
        { date: 'Jul 8', bpm: 74 }, { date: 'Jul 9', bpm: 71 },
      ],
      weightTrend: [
        { date: 'Jun 10', kg: 68.0, delta: '+0.1' }, { date: 'Jun 15', kg: 67.8, delta: '-0.2' },
        { date: 'Jun 20', kg: 68.2, delta: '+0.4' }, { date: 'Jun 27', kg: 68.0, delta: '-0.2' },
        { date: 'Jul 1', kg: 67.9, delta: '-0.1' }, { date: 'Jul 5', kg: 68.1, delta: '+0.2' },
        { date: 'Jul 8', kg: 68.0, delta: '-0.1' },
      ],
      bpTrend: [{ date: 'Jun 27', sys: 132, dia: 84 }, { date: 'Jul 5', sys: 128, dia: 80 }, { date: 'Jul 8', sys: 126, dia: 79 }],
    },
    labResults: [
      { date: 'Jul 8, 2026', name: 'HbA1c', value: 8.2, unit: '%', status: 'high',
        desirable: '<7.0%', refLow: null, refHigh: 7.0,
        history: [{ date: 'Jan 9', v: 10.1 }, { date: 'Mar 9', v: 9.4 }, { date: 'May 9', v: 8.8 }, { date: 'Jul 8', v: 8.2 }] },
      { date: 'Jul 8, 2026', name: 'Fasting Blood Sugar', value: 168, unit: 'mg/dL', status: 'high',
        desirable: '<130 mg/dL', refLow: null, refHigh: 130,
        history: [{ date: 'Jan 9', v: 210 }, { date: 'Mar 9', v: 192 }, { date: 'May 9', v: 180 }, { date: 'Jul 8', v: 168 }] },
      { date: 'Jul 8, 2026', name: 'Thyrotropin', value: 2.1, unit: 'mIU/L', status: 'normal',
        desirable: '0.4–4.0 mIU/L', refLow: 0.4, refHigh: 4.0,
        history: [{ date: 'Jan 9', v: 2.0 }, { date: 'Mar 9', v: 1.9 }, { date: 'May 9', v: 2.1 }, { date: 'Jul 8', v: 2.1 }] },
      { date: 'Jul 8, 2026', name: 'eGFR (Kidney)', value: 78, unit: 'mL/min', status: 'borderline',
        desirable: '>90 mL/min normal', refLow: 60, refHigh: 90,
        history: [{ date: 'Jan 9', v: 82 }, { date: 'Mar 9', v: 80 }, { date: 'May 9', v: 79 }, { date: 'Jul 8', v: 78 }] },
    ],
    references: [
      { title: 'Managing Type 2 Diabetes — A Patient Guide', url: '#', type: 'Article' },
      { title: 'Metformin — What to Expect', url: '#', type: 'Medication' },
      { title: 'Low-GI Diet Plan for Diabetic Patients', url: '#', type: 'Diet' },
      { title: 'Blood Sugar Monitoring at Home', url: '#', type: 'Guide' },
      { title: 'Hypoglycaemia — Recognition & First Aid', url: '#', type: 'Emergency' },
    ],
    contextPrompt: `Patient: Priya Patel, 45F. Diagnosis: Type 2 Diabetes, HbA1c 8.2%.
Medications: Metformin 1000mg BD, Glimepiride 2mg OD. Instructions: low-GI diet, post-meal walks, daily glucose monitoring.
Follow-up in 3 months for HbA1c. Red flags: hypoglycaemia (< 70 mg/dL), hyperglycaemia (> 300 mg/dL).
Doctor: Dr. Suresh Mehta, Endocrinologist.`,
  },
  'pat-003': {
    id: 'pat-003', name: 'Ravi Kumar', age: 33, gender: 'Male',
    dob: 'February 20, 1986', phone: '+91-97654-32109', mrn: 'MRN-003',
    email: 'ravi.kumar.asthma@demo.shifa.health',
    bloodType: 'O+', height: 168, weight: 71, bmi: 25.2,
    allergies: ['Dust mites', 'Cat dander'],
    emergencyContact: { name: 'Meena Kumar', relation: 'Mother', phone: '+91-97654-32108' },
    language: 'Kannada', specialty: 'Pulmonology',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    doctor: { name: 'Dr. Kavita Rao', specialty: 'Pulmonology', avatar: 'https://randomuser.me/api/portraits/women/29.jpg' },
    visits: [{
      id: 'v1', date: 'JUN 26', type: 'Office Visit',
      diagnosis: 'Moderate Persistent Asthma — Undertreated',
      diagnosisSince: 'March 5, 2020', severity: 'moderate', status: 'active',
      notes: 'Nocturnal symptoms 3x/week. Inhaler technique corrected. Added ICS-LABA.',
      medications: [
        { name: 'Budesonide/Formoterol 160/4.5mcg', freq: 'Twice daily — maintenance', notes: 'Rinse mouth after each use.' },
        { name: 'Salbutamol 100mcg', freq: 'As needed for rescue', notes: 'Max 4 puffs in 24 hours.' },
      ],
      vitals: { bp: '118/76', hr: '82 bpm', weight: '71 kg', spo2: '97%' },
      followUp: '6 weeks for spirometry review',
      redFlags: ['Severe breathlessness at rest', 'Rescue inhaler > 4x/day', 'Blue lips or fingertips'],
      instructions: ['Avoid smoke, dust, pet dander', 'Use spacer device with inhaler', 'Keep asthma action plan card'],
    }],
    vitalsData: {
      device: 'Pulse Oximeter + Peak Flow Meter', lastSync: 'Jul 9, 07:30 AM',
      summary: { restingHR: 82, pvcEvents: 0, steps: 7100, hrv: 38, sleep: 7.5, spo2: 97 },
      hrTrend: [
        { date: 'Jul 2', bpm: 84 }, { date: 'Jul 3', bpm: 80 }, { date: 'Jul 4', bpm: 82 },
        { date: 'Jul 5', bpm: 85 }, { date: 'Jul 6', bpm: 79 }, { date: 'Jul 7', bpm: 81 },
        { date: 'Jul 8', bpm: 83 }, { date: 'Jul 9', bpm: 80 },
      ],
      weightTrend: [
        { date: 'Jun 10', kg: 71.0, delta: '0.0' }, { date: 'Jun 20', kg: 71.2, delta: '+0.2' },
        { date: 'Jun 26', kg: 71.0, delta: '-0.2' }, { date: 'Jul 5', kg: 71.3, delta: '+0.3' },
        { date: 'Jul 8', kg: 71.1, delta: '-0.2' },
      ],
      bpTrend: [{ date: 'Jun 26', sys: 118, dia: 76 }, { date: 'Jul 8', sys: 116, dia: 74 }],
    },
    labResults: [
      { date: 'Jun 26', name: 'Spirometry FEV1', result: '72% predicted (FEV1/FVC 0.68)', status: 'abnormal' },
      { date: 'Jun 26', name: 'Peak Flow', result: '380 L/min (78% personal best)', status: 'borderline' },
      { date: 'Jun 26', name: 'SpO2', result: '97% on room air', status: 'normal' },
      { date: 'Jun 10', name: 'Chest X-Ray', result: 'Mild hyperinflation, no consolidation', status: 'borderline' },
      { date: 'Jun 10', name: 'Allergy Panel', result: 'Positive: dust mites, cockroach, cat', status: 'abnormal' },
    ],
    references: [
      { title: 'Understanding Your Asthma Diagnosis', url: '#', type: 'Article' },
      { title: 'How to Use Your Inhaler Correctly', url: '#', type: 'Guide' },
      { title: 'Asthma Triggers — Identify & Avoid', url: '#', type: 'Article' },
      { title: 'Budesonide/Formoterol — Patient Information', url: '#', type: 'Medication' },
      { title: 'When to Visit the Emergency Room', url: '#', type: 'Emergency' },
    ],
    contextPrompt: `Patient: Ravi Kumar, 38M. Diagnosis: Moderate Persistent Asthma.
Medications: Budesonide/Formoterol 160/4.5mcg BD, Salbutamol PRN.
Instructions: avoid triggers (dust, smoke, pets), use spacer, rinse mouth after ICS.
Follow-up 6 weeks spirometry. Red flags: severe breathlessness, rescue inhaler > 4x/day, cyanosis.
Doctor: Dr. Kavita Rao, Pulmonologist.`,
  },
}

for (let i = 4; i <= 12; i++) {
  const id = `pat-00${i}`
  if (!SCENARIOS[id]) {
    SCENARIOS[id] = {
      id, name: `Patient ${i}`, age: 40 + i, gender: i % 2 === 0 ? 'Female' : 'Male',
      dob: 'January 1, 1980', phone: '+91-90000-00000', mrn: `MRN-00${i}`,
      email: `patient${i}@demo.shifa.health`,
      bloodType: 'O+', height: 165, weight: 70, bmi: 25.7,
      allergies: [], emergencyContact: { name: 'Family Member', relation: 'Spouse', phone: '+91-90000-00001' },
      language: 'Hindi', specialty: 'General',
      avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i * 5}.jpg`,
      doctor: { name: 'Dr. Demo Doctor', specialty: 'General Medicine', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      visits: [{
        id: 'v1', date: 'JUN 28', type: 'Office Visit', diagnosis: 'General Consultation',
        diagnosisSince: 'June 28, 2026', severity: 'mild', status: 'resolved',
        notes: 'Routine check-up. Patient in good health.',
        medications: [], vitals: { bp: '120/80', hr: '72 bpm', weight: '70 kg', spo2: '99%' },
        followUp: '3 months', redFlags: ['Fever > 103°F'], instructions: ['Healthy diet', 'Regular exercise'],
      }],
      vitalsData: {
        device: 'Manual Vitals', lastSync: 'Jun 28, 10:00 AM',
        summary: { restingHR: 72, pvcEvents: 0, steps: 5000, hrv: 42, sleep: 7.0, spo2: 99 },
        hrTrend: [{ date: 'Jun 28', bpm: 72 }],
        weightTrend: [{ date: 'Jun 28', kg: 70.0, delta: '0.0' }],
        bpTrend: [{ date: 'Jun 28', sys: 120, dia: 80 }],
      },
      labResults: [{ date: 'Jun 28', name: 'General Panel', result: 'All normal', status: 'normal' }],
      references: [{ title: 'General Health Tips', url: '#', type: 'Article' }],
      contextPrompt: `Patient ${i}, general health consultation. All vitals normal.`,
    }
  }
}

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 5,
  borderRadius: 6, color: '#9ca3af', display: 'flex', alignItems: 'center',
}
const card = {
  background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
  padding: '20px 24px', marginBottom: 16,
}
const sectionTitle = { fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 16 }
const askBtn = (color = '#10b981') => ({
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'none', border: 'none', color, cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
})

// ─── AI CHAT PANEL ────────────────────────────────────────────────────────────
function AIChatPanel({ patient, context, onClose, isExpanded, onToggleExpand }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const SUGGESTED_BY_CONTEXT = {
    health: [
      'Give me an overview of my health record',
      'What are the key things in my medical history?',
      'Are there any concerning trends in my health data?',
    ],
    vitals: [
      'What do my vitals mean?',
      'Is my heart rate trend normal?',
      'Should I be concerned about my weight trend?',
    ],
    default: [
      'What does my diagnosis mean in simple terms?',
      'Explain my medication and side effects',
      'What should I watch out for at home?',
    ],
  }
  const suggested = SUGGESTED_BY_CONTEXT[context] || SUGGESTED_BY_CONTEXT.default

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = useCallback(async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const systemPrompt = `You are Shifa AI, a medical visit assistant for Indian patients.
Patient context: ${patient.contextPrompt}
Answer in simple, clear language. Be warm, reassuring, and accurate.
Never give emergency advice — always say to call 112 or go to hospital for emergencies.
Keep answers concise (3-5 sentences unless more is needed).`
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1000,
          system: systemPrompt,
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg }],
        }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content?.[0]?.text || 'Sorry, I could not process that.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Please try again.' }])
    } finally { setLoading(false) }
  }, [input, messages, patient])

  return (
    <div style={{
      width: isExpanded ? 460 : 320, minWidth: isExpanded ? 460 : 320,
      background: '#fff', borderLeft: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column', height: '100%',
      transition: 'width 0.2s ease, min-width 0.2s ease',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
        <CheckCircle2 size={18} color="#10b981" strokeWidth={2.5} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Shifa AI</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Ask anything about your visit</div>
        </div>
        <button onClick={onToggleExpand} style={iconBtn}>{isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
        <button onClick={onClose} style={iconBtn}><X size={14} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <div style={{ width: 56, height: 56, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <CheckCircle2 size={28} color="#10b981" strokeWidth={2} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}>Your visit assistant</div>
            {context === 'health' && (
              <div style={{ background: '#f0fdf4', color: '#10b981', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 10 }}>Patient Record</div>
            )}
            <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6, maxWidth: 220, margin: '0 auto 20px' }}>
              {context === 'health' ? 'Ask me anything about your health.' : 'I have full context of your visit. Ask me anything about your diagnosis, medications, or next steps.'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggested.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                  padding: '9px 12px', fontSize: 12, color: '#374151', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4,
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >{q}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', background: m.role === 'user' ? '#10b981' : '#f3f4f6',
                  color: m.role === 'user' ? '#fff' : '#111827',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '9px 12px', fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={14} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <button style={iconBtn}><Plus size={16} /></button>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask about your visit…" rows={1}
          style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4, maxHeight: 80, overflowY: 'auto' }}
          onFocus={e => e.currentTarget.style.borderColor = '#10b981'}
          onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
          background: input.trim() && !loading ? '#10b981' : '#e5e7eb', border: 'none',
          borderRadius: 8, padding: '8px 10px', cursor: input.trim() && !loading ? 'pointer' : 'default',
          color: input.trim() && !loading ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center',
        }}><Send size={14} /></button>
      </div>
    </div>
  )
}

// ─── MY HEALTH — HEALTH PROFILE TAB ──────────────────────────────────────────
function HealthProfileTab({ patient, visit, onAsk }) {
  return (
    <div>
      {/* Personal Info */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={sectionTitle}>Personal Information</div>
          <button style={{ ...askBtn('#10b981'), fontSize: 13 }}><Pencil size={13} /> Edit Profile</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
          {[
            { label: 'Full Name', value: patient.name },
            { label: 'Date of Birth', value: patient.dob },
            { label: 'Gender', value: patient.gender },
            { label: 'Phone', value: patient.phone },
            { label: 'Email', value: patient.email },
            { label: 'MRN', value: patient.mrn },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 600, marginBottom: 3, textTransform: 'capitalize' }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Biometrics */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={sectionTitle}>Biometrics</div>
          <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{patient.height}.0</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Height (cm)</div>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{patient.weight}.0</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Weight (kg)</div>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: patient.bmi > 25 ? '#f59e0b' : '#10b981' }}>{patient.bmi}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>BMI</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#374151' }}>Blood Type: <strong>{patient.bloodType}</strong></div>
      </div>

      {/* Diagnoses */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={sectionTitle}>Diagnoses</div>
          <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }}>{visit.diagnosis}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Since {visit.diagnosisSince}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{visit.severity}</span>
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{visit.status}</span>
          </div>
        </div>
      </div>

      {/* Recent Visits */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={sectionTitle}>Recent Visits</div>
          <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: '#6366f1', borderRadius: 8, padding: '4px 8px', textAlign: 'center', minWidth: 44 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase' }}>{visit.date.split(' ')[0]}</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{visit.date.split(' ')[1]}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{visit.notes.substring(0, 50)}…</div>
            <div style={{ fontSize: 12, color: '#10b981', marginTop: 2 }}>{patient.doctor.name}</div>
          </div>
          <ChevronRight size={16} color="#d1d5db" />
        </div>
      </div>

      {/* Allergies */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={sectionTitle}>Allergies</div>
          <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {patient.allergies.length === 0
            ? <span style={{ fontSize: 13, color: '#9ca3af' }}>No known allergies</span>
            : patient.allergies.map((a, i) => (
              <span key={i} style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 20 }}>{a}</span>
            ))
          }
        </div>
      </div>

      {/* Emergency Contact */}
      <div style={card}>
        <div style={sectionTitle}>Emergency Contact</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 2 }}>{patient.emergencyContact.name}</div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>{patient.emergencyContact.relation}</div>
        <div style={{ fontSize: 13, color: '#374151' }}>{patient.emergencyContact.phone}</div>
      </div>
    </div>
  )
}

// ─── MY HEALTH — VITALS TAB ───────────────────────────────────────────────────
function VitalsTab({ patient, onAsk }) {
  const [period, setPeriod] = useState('30d')
  const v = patient.vitalsData
  const PERIODS = ['7d', '30d', '90d', '1y']

  // Compute cumulative average for the orange dashed trend line — must be defined BEFORE DeltaLabel
  const weightWithTrend = v.weightTrend.map((d, i, arr) => ({
    ...d,
    trend: parseFloat((arr.slice(0, i + 1).reduce((s, p) => s + p.kg, 0) / (i + 1)).toFixed(2)),
  }))

  // Delta label above each bar — reads delta STRING from data entry by index, never touches numeric value prop
  const DeltaLabel = ({ x, y, width, index }) => {
    const entry = weightWithTrend[index]
    if (!entry) return null
    const str = String(entry.delta ?? '')
    if (!str || str === '0.0' || str === '+0.0' || str === '-0.0') return null
    const isNeg = str.startsWith('-')
    return (
      <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 5}
        textAnchor="middle" fontSize={9} fontWeight={700}
        fill={isNeg ? '#10b981' : '#ef4444'}>
        {str}
      </text>
    )
  }

  const avgWeight = (v.weightTrend.reduce((s, d) => s + d.kg, 0) / v.weightTrend.length).toFixed(1)
  const rawGain = v.weightTrend[v.weightTrend.length - 1].kg - v.weightTrend[0].kg
  const weightGain = rawGain.toFixed(1)
  const gainPositive = rawGain > 0

  // Tooltip shared style
  const TT = {
    contentStyle: { borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 },
    cursor: { stroke: '#e5e7eb', strokeWidth: 1 },
  }

  // 2×3 metric grid matching screenshot exactly
  const METRICS = [
    { label: 'Resting HR',    value: v.summary.restingHR },
    { label: v.summary.pvcEvents > 0 ? 'PVC Events (7d)' : 'Daily Steps',
      value: v.summary.pvcEvents > 0 ? v.summary.pvcEvents : v.summary.steps.toLocaleString() },
    { label: 'Steps Today',   value: v.summary.steps.toLocaleString() },
    { label: 'Avg HRV (ms)',  value: v.summary.hrv },
    { label: 'Avg Sleep (h)', value: v.summary.sleep },
    { label: 'Avg SpO2',      value: `${v.summary.spo2}%` },
  ]

  return (
    <div>
      {/* ── Device card ───────────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 20 }}>
        {/* Device header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, background: '#111827', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Watch size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{v.device}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Last sync: {v.lastSync}</div>
            </div>
          </div>
          <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
        </div>

        {/* 2-row × 3-col metric grid: internal dividers only, no outer rounded border */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {METRICS.map(({ label, value }, i) => {
            const col = i % 3
            const row = Math.floor(i / 3)
            return (
              <div key={label} style={{
                padding: '20px 10px', textAlign: 'center',
                borderRight: col < 2 ? '1px solid #e5e7eb' : 'none',
                borderBottom: row === 0 ? '1px solid #e5e7eb' : 'none',
                background: '#fff',
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 7 }}>{label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Period selector pills ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '6px 18px', borderRadius: 999, border: 'none',
            background: period === p ? '#10b981' : '#e5e7eb',
            color: period === p ? '#fff' : '#374151',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>{p}</button>
        ))}
      </div>

      {/* ── Resting Heart Rate Trend ──────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 20, paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Resting Heart Rate Trend</div>
          <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={v.hrTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {/* Both vertical and horizontal grid lines, matching screenshot */}
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false} tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              domain={[50, 110]}
              ticks={[50, 60, 70, 80, 90, 100, 110]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false} tickLine={false}
              label={{ value: 'bpm', angle: -90, position: 'insideLeft', offset: 12, dy: 15, style: { fontSize: 11, fill: '#9ca3af' } }}
              width={44}
            />
            <Tooltip {...TT} formatter={(val) => [`${val} bpm`, 'Heart Rate']} />
            <Area
              type="monotone" dataKey="bpm" name="Heart Rate"
              stroke="#ef4444" strokeWidth={2.5}
              fill="url(#hrGrad)"
              dot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }}
              activeDot={{ r: 7, fill: '#ef4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Weight Trend ──────────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 20, paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Weight Trend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12.5, color: '#6b7280' }}>Avg: {avgWeight} kg</span>
            <span style={{
              background: gainPositive ? '#fef2f2' : '#f0fdf4',
              color: gainPositive ? '#dc2626' : '#15803d',
              fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
            }}>
              {rawGain > 0 ? '+' : ''}{weightGain} kg
            </span>
            <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
          </div>
        </div>

        {/* Legend row — centered, matches screenshot */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width={28} height={12}>
              <line x1={0} y1={6} x2={28} y2={6} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 4" />
            </svg>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Trend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 14, height: 14, background: '#a78bfa', borderRadius: 3 }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>Weight</span>
          </div>
        </div>

        {/* ComposedChart: Bar + Line in same chart */}
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={weightWithTrend} margin={{ top: 22, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false} tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false} tickLine={false}
              label={{ value: 'kg', angle: -90, position: 'insideLeft', offset: 12, dy: 10, style: { fontSize: 11, fill: '#9ca3af' } }}
              width={44}
            />
            <Tooltip {...TT} formatter={(val, name) => [
              `${typeof val === 'number' ? val.toFixed(1) : val} kg`,
              name === 'trend' ? 'Trend' : 'Weight',
            ]} />
            {/* Purple bars with delta labels */}
            <Bar dataKey="kg" name="Weight" fill="#a78bfa" radius={[3, 3, 0, 0]} label={<DeltaLabel />} />
            {/* Orange dashed trend line */}
            <Line
              type="monotone" dataKey="trend" name="trend"
              stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4"
              dot={false} activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Blood Pressure Trend ──────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 20, paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Blood Pressure Trend</div>
          <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
        </div>

        {/* Centered legend with hollow rectangle swatches matching screenshot */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 14, border: '2.5px solid #ef4444', borderRadius: 3, background: 'transparent' }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>Systolic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 14, border: '2.5px solid #3b82f6', borderRadius: 3, background: 'transparent' }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>Diastolic</span>
          </div>
        </div>

        {/* Dots-only scatter: strokeWidth=0 on lines so only circles show */}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={v.bpTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false} tickLine={false}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              domain={[60, 180]}
              ticks={[60, 80, 100, 120, 140, 160, 180]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false} tickLine={false}
              label={{ value: 'mmHg', angle: -90, position: 'insideLeft', offset: 12, dy: 20, style: { fontSize: 11, fill: '#9ca3af' } }}
              width={50}
            />
            <Tooltip {...TT} formatter={(val, name) => [`${val} mmHg`, name]} />
            {/* No connecting line — just hollow circle dots */}
            <Line
              type="monotone" dataKey="sys" name="Systolic"
              stroke="#ef4444" strokeWidth={0}
              dot={{ r: 8, fill: '#fff', stroke: '#ef4444', strokeWidth: 2.5 }}
              activeDot={{ r: 10, fill: '#fff', stroke: '#ef4444', strokeWidth: 2.5 }}
            />
            <Line
              type="monotone" dataKey="dia" name="Diastolic"
              stroke="#3b82f6" strokeWidth={0}
              dot={{ r: 8, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2.5 }}
              activeDot={{ r: 10, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── MY HEALTH — LAB RESULTS TAB ─────────────────────────────────────────────
function LabResultsTab({ patient, onAsk }) {
  const [period, setPeriod] = useState('1y')
  const [dragging, setDragging] = useState(false)
  const PERIODS = ['7d', '30d', '90d', '1y']

  const STATUS_STYLE = {
    normal:     { bg: '#f0fdf4', text: '#15803d', label: 'NORMAL',     dot: '#10b981' },
    borderline: { bg: '#fef9c3', text: '#92400e', label: 'BORDERLINE', dot: '#f59e0b' },
    high:       { bg: '#fef2f2', text: '#dc2626', label: 'HIGH',       dot: '#ef4444' },
    abnormal:   { bg: '#fef2f2', text: '#dc2626', label: 'ABNORMAL',   dot: '#ef4444' },
  }

  const TT = {
    contentStyle: { borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 },
    cursor: { stroke: '#e5e7eb', strokeWidth: 1 },
  }

  return (
    <div>
      {/* ── Upload zone ───────────────────────────────────────────────── */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false) }}
        style={{
          border: `2px dashed ${dragging ? '#10b981' : '#d1d5db'}`,
          borderRadius: 14, padding: '36px 24px', textAlign: 'center',
          background: dragging ? '#f0fdf4' : '#fff',
          marginBottom: 20, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.5}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div style={{ fontSize: 13.5, color: '#6b7280' }}>
          Drag & drop lab results here, or{' '}
          <span style={{ color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>browse files</span>
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
          PDF, JPG, PNG, HEIC — max 10 MB per file
        </div>
      </div>

      {/* ── Period selector ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '5px 18px', borderRadius: 999, border: 'none',
            background: period === p ? '#10b981' : '#e5e7eb',
            color: period === p ? '#fff' : '#374151',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>{p}</button>
        ))}
      </div>

      {/* ── Section header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Lab Results</div>
        <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
      </div>

      {/* ── Per-test cards ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {patient.labResults.map((r, i) => {
          const s = STATUS_STYLE[r.status] || STATUS_STYLE.normal
          const hasChart = r.history && r.history.length > 1
          const yVals = hasChart ? r.history.map(h => h.v) : []
          const yMin = yVals.length ? Math.min(...yVals) * 0.95 : 0
          const yMax = yVals.length ? Math.max(...yVals) * 1.05 : 10
          const dotColor = r.status === 'normal' ? '#10b981' : '#ef4444'

          return (
            <div key={i} style={{ ...card, paddingBottom: 20 }}>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: hasChart ? 20 : 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5, color: '#111827' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{r.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {r.value !== null && r.value !== undefined && (
                    <div style={{ marginBottom: 5 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: s.text }}>{r.value}</span>
                      {' '}<span style={{ fontSize: 12, color: '#9ca3af' }}>{r.unit}</span>
                    </div>
                  )}
                  <span style={{
                    background: s.bg, color: s.text,
                    fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 6,
                    letterSpacing: 0.4, display: 'inline-block', marginBottom: 5,
                  }}>{s.label}</span>
                  <div style={{ fontSize: 11.5, color: '#9ca3af' }}>{r.desirable}</div>
                  <button onClick={onAsk} style={{ ...askBtn(), marginTop: 8 }}><CheckCircle2 size={12} /> Ask</button>
                </div>
              </div>

              {/* Trend chart */}
              {hasChart && (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={r.history} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      domain={[yMin, yMax]}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false} tickLine={false}
                      label={{ value: r.unit, angle: -90, position: 'insideLeft', offset: 12, dy: 20, style: { fontSize: 11, fill: '#9ca3af' } }}
                      width={50}
                    />
                    <Tooltip {...TT} formatter={(val) => [`${val} ${r.unit}`, r.name]} />
                    {/* Upper reference line (red dashed) */}
                    {r.refHigh !== null && r.refHigh !== undefined && (
                      <ReferenceLine y={r.refHigh} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1.5} />
                    )}
                    {/* Lower reference line (blue dashed) */}
                    {r.refLow !== null && r.refLow !== undefined && (
                      <ReferenceLine y={r.refLow} stroke="#93c5fd" strokeDasharray="4 4" strokeWidth={1.5} />
                    )}
                    <Line
                      type="linear" dataKey="v" name={r.name}
                      stroke="#111827" strokeWidth={2.5}
                      dot={{ r: 6, fill: dotColor, stroke: dotColor, strokeWidth: 0 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Text-only result (no chart) */}
              {!hasChart && r.note && (
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#374151', marginTop: 12 }}>
                  {r.note}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MY HEALTH — CONNECTED SERVICES TAB ──────────────────────────────────────
function ConnectedServicesTab() {
  const [services, setServices] = useState({
    'apple-health': true, 'epic': true, 'cvs': true, 'aetna': true,
  })

  const toggle = (key) => setServices(prev => ({ ...prev, [key]: !prev[key] }))

  const SECTIONS = [
    {
      label: 'WEARABLES', icon: '⏱', total: 6,
      items: [
        { key: 'apple-health', name: 'Apple Health', desc: 'Sync heart rate, activity, sleep, and ECG data', tags: ['Heart Rate', 'Steps', 'ECG', 'Sleep'], syncedAgo: '2 hours ago', logo: '🍎', logoBg: '#fff1f2' },
        { key: 'google-fit',   name: 'Google Fit',   desc: 'Activity tracking and health metrics',          tags: ['Steps', 'Heart Rate', 'Weight'],       logo: 'G',  logoBg: '#fff', logoColor: '#4285F4' },
        { key: 'fitbit',       name: 'Fitbit',        desc: 'Comprehensive health and wellness tracking',   tags: ['Heart Rate', 'Sleep', 'SpO2', 'Steps'], logo: '⬛', logoBg: '#f0f4ff' },
        { key: 'samsung',      name: 'Samsung Health', desc: 'Galaxy Watch and phone sensor data',          tags: ['Heart Rate', 'BP', 'Body Comp'],        logo: '💙', logoBg: '#eff6ff' },
        { key: 'garmin',       name: 'Garmin Connect', desc: 'GPS, heart rate, and performance data',       tags: ['Heart Rate', 'VO2 Max', 'Steps'],       logo: '🔵', logoBg: '#eff6ff' },
        { key: 'withings',     name: 'Withings',       desc: 'Smart scales, BP monitors, sleep trackers',  tags: ['Weight', 'BP', 'Sleep', 'ECG'],         logo: 'W',  logoBg: '#f0fdf4', logoColor: '#10b981' },
      ],
    },
    {
      label: 'EHR PORTALS', icon: '🏥', total: 2,
      items: [
        { key: 'epic',   name: 'Epic MyChart',       desc: 'Access medical records, lab results, and appointments', tags: ['Records', 'Labs', 'Meds', 'Notes'], syncedAgo: '1 day ago',  logo: '💧', logoBg: '#fdf4ff' },
        { key: 'cerner', name: 'Cerner / Oracle Health', desc: 'Hospital records and care summaries',                 tags: ['Records', 'Labs', 'Discharge'],     logo: '➕', logoBg: '#fef2f2' },
      ],
    },
    {
      label: 'PHARMACIES', icon: '💊', total: 2,
      items: [
        { key: 'cvs',       name: 'CVS Pharmacy', desc: 'Prescription history and refill tracking',         tags: ['Rx History', 'Refills', 'Costs'],   syncedAgo: '3 days ago', logo: '❤️', logoBg: '#fef2f2' },
        { key: 'walgreens', name: 'Walgreens',    desc: 'Medications, immunizations, and health records',   tags: ['Rx History', 'Immunizations'],      logo: '🫙', logoBg: '#f0fdf4' },
      ],
    },
    {
      label: 'LABS', icon: '🧪', total: 2,
      items: [
        { key: 'quest', name: 'Quest Diagnostics', desc: 'Lab test results and ordering',     tags: ['Lab Results', 'Pathology'], logo: 'T', logoBg: '#eff6ff', logoColor: '#1d4ed8' },
        { key: 'labcorp', name: 'Labcorp',         desc: 'Comprehensive lab testing results', tags: ['Lab Results', 'Genetics'],  logo: '🔷', logoBg: '#eff6ff' },
      ],
    },
    {
      label: 'INSURANCE', icon: '🛡', total: 2,
      items: [
        { key: 'aetna',          name: 'Aetna',           desc: 'Claims, coverage details, and EOBs',       tags: ['Claims', 'Coverage', 'EOBs'],    syncedAgo: '1 week ago', logo: '💜', logoBg: '#faf5ff' },
        { key: 'unitedhealthcare', name: 'UnitedHealthcare', desc: 'Benefits, claims status, and provider network', tags: ['Claims', 'Benefits', 'Network'], logo: '🛡', logoBg: '#eff6ff' },
      ],
    },
  ]

  const connectedCount = Object.values(services).filter(Boolean).length

  // Button color per service (matching screenshot's varied brand colors)
  const CONNECT_BTN_COLORS = {
    'google-fit': '#4285F4', 'fitbit': '#10b981', 'samsung': '#1d4ed8',
    'garmin': '#1d4ed8', 'withings': '#10b981', 'cerner': '#dc2626',
    'walgreens': '#dc2626', 'quest': '#1d4ed8', 'labcorp': '#1d4ed8',
    'unitedhealthcare': '#1d4ed8',
  }

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: '#374151' }}>
          <strong>{connectedCount}</strong> of <strong>14</strong> services connected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={11} width={18} height={11} rx={2} /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          HIPAA compliant
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const connectedInSection = section.items.filter(item => services[item.key]).length
        return (
          <div key={section.label} style={{ marginBottom: 28 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#9ca3af', letterSpacing: 1 }}>
                {section.label}
              </span>
              <span style={{ fontSize: 11.5, color: '#9ca3af' }}>{connectedInSection}/{section.items.length}</span>
            </div>

            {/* 2-column service grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {section.items.map(item => {
                const isConnected = !!services[item.key]
                const btnColor = CONNECT_BTN_COLORS[item.key] || '#10b981'
                return (
                  <div key={item.key} style={{
                    background: '#fff',
                    border: isConnected ? '1.5px solid #d1fae5' : '1.5px solid #e5e7eb',
                    borderRadius: 14, padding: '18px 20px',
                    display: 'flex', flexDirection: 'column', gap: 0,
                  }}>
                    {/* Logo + name + status dot */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: item.logoBg || '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: item.logo.length === 1 && /[A-Z]/.test(item.logo) ? 18 : 22,
                        fontWeight: 700, color: item.logoColor || '#374151',
                        border: '1px solid #f3f4f6',
                      }}>
                        {item.logo}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{item.name}</span>
                          {isConnected && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                              Connected
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.4 }}>{item.desc}</div>
                      </div>
                    </div>

                    {/* Capability tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {item.tags.map(tag => (
                        <span key={tag} style={{
                          background: '#f3f4f6', color: '#374151',
                          fontSize: 11.5, fontWeight: 500, padding: '3px 9px', borderRadius: 20,
                        }}>{tag}</span>
                      ))}
                    </div>

                    {/* Footer: sync time + action button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {isConnected && item.syncedAgo ? `Synced ${item.syncedAgo}` : (!isConnected ? 'Not connected' : '')}
                      </span>
                      <button
                        onClick={() => toggle(item.key)}
                        style={{
                          background: isConnected ? 'none' : btnColor,
                          border: 'none', borderRadius: 8,
                          padding: '6px 18px', fontSize: 13, fontWeight: 600,
                          color: isConnected ? '#6b7280' : '#fff',
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── MY HEALTH — DOCUMENTS TAB ────────────────────────────────────────────────
function DocumentsTab() {
  const [dragging, setDragging] = useState(false)
  const [docs, setDocs] = useState([])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const newDocs = files.map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.round(f.size / 1024)} KB`,
      type: f.name.split('.').pop().toUpperCase(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }))
    setDocs(prev => [...prev, ...newDocs])
  }

  const removeDoc = (i) => setDocs(prev => prev.filter((_, idx) => idx !== i))

  const TYPE_COLORS = {
    PDF: { bg: '#fef2f2', text: '#dc2626' },
    JPG: { bg: '#eff6ff', text: '#1d4ed8' },
    PNG: { bg: '#eff6ff', text: '#1d4ed8' },
    WEBP: { bg: '#f0fdf4', text: '#15803d' },
    HEIC: { bg: '#fdf4ff', text: '#7c3aed' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Upload zone ───────────────────────────────────────────────── */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? '#10b981' : '#d1d5db'}`,
          borderRadius: 14, padding: '44px 24px', textAlign: 'center',
          background: dragging ? '#f0fdf4' : '#fff',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {/* Cloud upload icon */}
        <div style={{ marginBottom: 14 }}>
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none"
            stroke={dragging ? '#10b981' : '#9ca3af'} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>
        <div style={{ fontSize: 14, color: '#374151' }}>
          Drag files here or{' '}
          <span style={{ color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>browse</span>
        </div>
        <div style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 6 }}>
          PDF, JPG, PNG, WebP, HEIC up to 20 MB
        </div>
      </div>

      {/* ── Medical Documents card ────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: docs.length > 0 ? '1px solid #f3f4f6' : 'none' }}>
          <div style={{ fontWeight: 700, fontSize: 15.5, color: '#111827' }}>Medical Documents</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>{docs.length} file{docs.length !== 1 ? 's' : ''}</div>
        </div>

        {docs.length === 0 ? (
          /* Empty state */
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: 14 }}>
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none"
                stroke="#d1d5db" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
                style={{ margin: '0 auto' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#6b7280', marginBottom: 6 }}>
              No documents yet
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Upload your medical records, lab results, or imaging reports
            </div>
          </div>
        ) : (
          /* File list */
          <div style={{ padding: '8px 0' }}>
            {docs.map((d, i) => {
              const clr = TYPE_COLORS[d.type] || { bg: '#f3f4f6', text: '#374151' }
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 24px',
                  borderBottom: i < docs.length - 1 ? '1px solid #f9fafb' : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                    background: clr.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={17} color={clr.text} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {d.type} · {d.size} · {d.date}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <ExternalLink size={14} color="#9ca3af" style={{ cursor: 'pointer' }} />
                    <button onClick={() => removeDoc(i)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 2, display: 'flex', alignItems: 'center',
                    }}>
                      <X size={14} color="#9ca3af" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MY HEALTH PAGE (inline, replaces profile content) ────────────────────────
function MyHealthPage({ patient, visit, onBack, onAsk }) {
  const [subTab, setSubTab] = useState('Health Profile')
  const SUB_TABS = [
    { key: 'Health Profile', icon: <User size={14} /> },
    { key: 'Vitals', icon: <Heart size={14} /> },
    { key: 'Lab Results', icon: <FlaskConical size={14} /> },
    { key: 'Connected Services', icon: <Link2 size={14} /> },
    { key: 'Documents', icon: <FolderOpen size={14} /> },
  ]
  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>My Health</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
          ← Back to Profile
        </button>
      </div>
      {/* Sub-tab pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 999, border: '1px solid #e5e7eb',
            background: subTab === t.key ? '#10b981' : '#fff',
            color: subTab === t.key ? '#fff' : '#374151',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            {t.icon} {t.key}
          </button>
        ))}
      </div>
      {/* Tab content */}
      {subTab === 'Health Profile' && <HealthProfileTab patient={patient} visit={visit} onAsk={onAsk} />}
      {subTab === 'Vitals' && <VitalsTab patient={patient} onAsk={onAsk} />}
      {subTab === 'Lab Results' && <LabResultsTab patient={patient} onAsk={onAsk} />}
      {subTab === 'Connected Services' && <ConnectedServicesTab />}
      {subTab === 'Documents' && <DocumentsTab />}
    </div>
  )
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, icon, children, wide }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: wide ? 600 : 460, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon}
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827', flex: 1 }}>{title}</span>
          <button onClick={onClose} style={iconBtn}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── REFERENCE PAGE (inline, 3 tabs) ──────────────────────────────────────────
function ReferencePage({ patient, onBack, onAsk }) {
  const [refTab, setRefTab] = useState('Relevant for You')
  const REF_TABS = ['Relevant for You', 'Search Databases', 'My Library']

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 24, color: '#111827', marginBottom: 4 }}>Reference</div>
          <div style={{ fontSize: 13.5, color: '#9ca3af' }}>Evidence-based references and medical databases relevant to your care.</div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
          ← Back to Profile
        </button>
      </div>

      {/* 3-tab switcher — pill-style with white active bg */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 12, padding: 4, gap: 2, marginTop: 20, marginBottom: 24 }}>
        {REF_TABS.map(t => (
          <button key={t} onClick={() => setRefTab(t)} style={{
            flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none',
            background: refTab === t ? '#fff' : 'transparent',
            color: refTab === t ? '#111827' : '#6b7280',
            fontWeight: refTab === t ? 700 : 500, fontSize: 13.5,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: refTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {refTab === 'Relevant for You' && <ReferenceRelevantTab patient={patient} onAsk={onAsk} />}
      {refTab === 'Search Databases' && <ReferenceSearchTab />}
      {refTab === 'My Library' && <ReferenceLibraryTab patient={patient} />}
    </div>
  )
}

// ── Tab 1: Relevant for You ────────────────────────────────────────────────────
function ReferenceRelevantTab({ patient, onAsk }) {
  const visit = patient.visits[0]

  // Build conditions list from diagnosis + known conditions
  const conditions = [
    visit.diagnosis,
    ...(patient.chronicConditions || []),
  ].filter(Boolean).slice(0, 5)

  // Build medications list
  const medications = visit.medications || []

  // Static curated resources
  const resources = patient.references || []

  const SectionHeader = ({ icon, label, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 14.5, color: '#111827' }}>{label}</span>
      <span style={{
        background: '#fef9c3', color: '#92400e',
        fontSize: 11.5, fontWeight: 700, padding: '1px 8px', borderRadius: 20, minWidth: 22, textAlign: 'center',
      }}>{count}</span>
    </div>
  )

  const ItemRow = ({ text, sub, onAskClick }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{text}</div>
        {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={onAskClick} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Your Conditions */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 24px' }}>
        <SectionHeader icon="⚠️" label="Your Conditions" count={conditions.length} />
        {conditions.map((c, i) => (
          <ItemRow key={i} text={c} onAskClick={onAsk} />
        ))}
      </div>

      {/* Your Medications */}
      {medications.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 24px' }}>
          <SectionHeader icon="🧪" label="Your Medications" count={medications.length} />
          {medications.map((m, i) => (
            <ItemRow key={i} text={m.name} sub={`${m.freq}${m.notes ? ' · ' + m.notes : ''}`} onAskClick={onAsk} />
          ))}
        </div>
      )}

      {/* Curated Resources */}
      {resources.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 24px' }}>
          <SectionHeader icon="📚" label="Curated Resources" count={resources.length} />
          {resources.map((r, i) => {
            const TYPE_COLORS = {
              Article: { bg: '#eff6ff', text: '#1d4ed8' }, Medication: { bg: '#f0fdf4', text: '#15803d' },
              Diet: { bg: '#fef9c3', text: '#92400e' }, Guide: { bg: '#fdf4ff', text: '#7c3aed' }, Emergency: { bg: '#fef2f2', text: '#dc2626' },
            }
            const clr = TYPE_COLORS[r.type] || TYPE_COLORS.Article
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < resources.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 3 }}>{r.title}</div>
                    <span style={{ background: clr.bg, color: clr.text, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{r.type}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={onAsk} style={askBtn()}><CheckCircle2 size={13} /> Ask</button>
                  <ExternalLink size={14} color="#9ca3af" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab 2: Search Databases ────────────────────────────────────────────────────
function ReferenceSearchTab() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Conditions')
  const CATEGORIES = ['Conditions', 'Drugs', 'Procedures', 'Guidelines']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* OpenEvidence banner */}
      <div style={{ background: '#f5f3ff', border: '1px solid #e0d9ff', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 40, height: 40, background: '#ede9fe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={2}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>OpenEvidence Integration</span>
            <span style={{ background: '#e0d9ff', color: '#6d28d9', fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, letterSpacing: 0.3 }}>COMING SOON</span>
          </div>
          <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.5 }}>
            AI-powered evidence-based answers cross-referenced with your visit context. Ask clinical questions and get responses grounded in peer-reviewed research.
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}><circle cx={11} cy={11} r={8}/><line x1={21} y1={21} x2={16.65} y2={16.65}/></svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search conditions, drugs, procedures..."
            style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13.5, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#10b981'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', background: '#fff' }}
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Search
        </button>
      </div>

      {/* Powered-by note */}
      <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
        Powered by NIH Clinical Tables, NLM RxTerms, DailyMed, and PubMed<br />
        Medical references are for informational purposes only. Always consult your healthcare provider.
      </div>
    </div>
  )
}

// ── Tab 3: My Library ──────────────────────────────────────────────────────────
function ReferenceLibraryTab({ patient }) {
  const [url, setUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const [libraryItems, setLibraryItems] = useState([
    {
      title: 'WHO Cardiovascular Risk Assessment and Management',
      status: 'Completed',
      tags: ['Cardiovascular Disease', 'Risk Assessment', 'Primary Prevention', 'Hypertension'],
      expanded: false,
    },
    {
      title: 'AHA Patient Education: Premature Ventricular Contractions (PVCs)',
      status: 'Completed',
      tags: ['Premature Ventricular Contractions', 'Arrhythmia', 'Patient Education'],
      expanded: false,
    },
    {
      title: 'NIH MedlinePlus: Heart Arrhythmia Guide',
      status: 'Completed',
      tags: ['Arrhythmia', 'Heart Rhythm Disorders', 'Cardiac Monitoring', 'Treatment Options'],
      expanded: false,
    },
  ])

  const addUrl = () => {
    if (!url.trim()) return
    setLibraryItems(prev => [{
      title: url,
      status: 'Processing',
      tags: [],
      expanded: false,
    }, ...prev])
    setUrl('')
  }

  const toggleExpand = (i) => setLibraryItems(prev => prev.map((item, idx) => idx === i ? { ...item, expanded: !item.expanded } : item))
  const removeItem = (i) => setLibraryItems(prev => prev.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Add to library section */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={16} color="#3b82f6" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Add to Your Library</span>
        </div>

        {/* PDF upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault(); setDragging(false)
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
            files.forEach(f => setLibraryItems(prev => [{ title: f.name, status: 'Processing', tags: [], expanded: false }, ...prev]))
          }}
          style={{
            border: `2px dashed ${dragging ? '#6366f1' : '#e5e7eb'}`,
            borderRadius: 12, padding: '28px 24px', textAlign: 'center',
            background: dragging ? '#f5f3ff' : '#fafafa',
            marginBottom: 14, cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={dragging ? '#6366f1' : '#9ca3af'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="12" x2="12" y2="18"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div style={{ fontSize: 13.5, color: '#374151' }}>
            <span style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>Click to upload</span> or drag and drop
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>PDF files only</div>
        </div>

        {/* URL input */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUrl()}
              placeholder="Paste a URL to a medical article..."
              style={{ width: '100%', padding: '11px 14px 11px 36px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <button onClick={addUrl} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Add
          </button>
        </div>
      </div>

      {/* Library items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {libraryItems.map((item, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
              onClick={() => toggleExpand(i)}>
              <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.title}</span>
                  <span style={{
                    background: item.status === 'Completed' ? '#f0fdf4' : '#fef9c3',
                    color: item.status === 'Completed' ? '#15803d' : '#92400e',
                    fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, flexShrink: 0,
                  }}>{item.status}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.tags.map(tag => (
                    <span key={tag} style={{ background: '#f3f4f6', color: '#374151', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={e => { e.stopPropagation(); removeItem(i) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <X size={14} color="#9ca3af" />
                </button>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}
                  style={{ transform: item.expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            {item.expanded && (
              <div style={{ padding: '0 20px 16px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ paddingTop: 12, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  {item.status === 'Completed'
                    ? 'This reference has been processed and is available for AI-powered Q&A. Click "Ask" in the chat to get evidence-based answers about this document.'
                    : 'This document is being processed. It will be available for AI-powered Q&A shortly.'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScheduleModal({ doctor, followUp, onClose }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const TIMES = ['9:00 AM', '10:30 AM', '11:00 AM', '2:00 PM', '3:30 PM', '5:00 PM']
  if (confirmed) return (
    <Modal title="Appointment Confirmed" onClose={onClose} icon={<CheckCircle2 size={18} color="#10b981" />}>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 12 }} />
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 6 }}>Appointment Scheduled!</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>With {doctor.name} on <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong></div>
      </div>
    </Modal>
  )
  return (
    <Modal title="Schedule Follow-up" onClose={onClose} icon={<Calendar size={18} color="#6366f1" />}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase' }}>Reason</div>
        <div style={{ fontSize: 13, color: '#374151', background: '#f9fafb', padding: '10px 12px', borderRadius: 8 }}>{followUp}</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase' }}>Select Date</div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>Select Time</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {TIMES.map(t => (
            <button key={t} onClick={() => setSelectedTime(t)} style={{ padding: '8px', border: `1.5px solid ${selectedTime === t ? '#10b981' : '#e5e7eb'}`, background: selectedTime === t ? '#f0fdf4' : '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: selectedTime === t ? '#10b981' : '#374151', cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>
      <button onClick={() => { if (selectedDate && selectedTime) setConfirmed(true) }} disabled={!selectedDate || !selectedTime}
        style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: selectedDate && selectedTime ? '#6366f1' : '#e5e7eb', color: selectedDate && selectedTime ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 14, cursor: selectedDate && selectedTime ? 'pointer' : 'default' }}>
        Confirm Appointment
      </button>
    </Modal>
  )
}

function VisitDetailModal({ visit, doctor, onClose }) {
  const [tab, setTab] = useState('summary')
  return (
    <Modal title={`Visit — ${visit.date}`} onClose={onClose} icon={<FileText size={18} color="#10b981" />} wide>
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 16, gap: 0 }}>
        {['summary', 'medications', 'vitals', 'instructions'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', border: 'none', background: 'none', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? '#10b981' : '#6b7280', borderBottom: tab === t ? '2px solid #10b981' : '2px solid transparent', cursor: 'pointer', marginBottom: -1, textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>
      {tab === 'summary' && (
        <div>
          <div style={{ marginBottom: 10 }}><span style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', minWidth: 80, display: 'inline-block' }}>Diagnosis</span><span style={{ fontSize: 13, color: '#374151' }}>{visit.diagnosis}</span></div>
          <div style={{ marginBottom: 10 }}><span style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', minWidth: 80, display: 'inline-block' }}>Doctor</span><span style={{ fontSize: 13, color: '#374151' }}>{doctor.name} · {doctor.specialty}</span></div>
          <div style={{ background: '#f9fafb', padding: '12px', borderRadius: 8, fontSize: 13, color: '#374151', lineHeight: 1.6, marginTop: 10 }}>{visit.notes}</div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 8 }}>⚠️ Red Flags</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>{visit.redFlags.map((f, i) => <li key={i} style={{ fontSize: 13, color: '#dc2626', marginBottom: 4 }}>{f}</li>)}</ul>
          </div>
        </div>
      )}
      {tab === 'medications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visit.medications.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13 }}>No medications prescribed.</div>}
          {visit.medications.map((m, i) => (
            <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}><Pill size={13} color="#10b981" style={{ marginRight: 6, verticalAlign: 'middle' }} />{m.name}</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 4 }}><Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />{m.freq}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>{m.notes}</div>
            </div>
          ))}
        </div>
      )}
      {tab === 'vitals' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.entries(visit.vitals).map(([k, v]) => (
            <div key={k} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                {k === 'bp' ? 'Blood Pressure' : k === 'hr' ? 'Heart Rate' : k === 'spo2' ? 'SpO₂' : 'Weight'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {tab === 'instructions' && (
        <div>
          <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, fontSize: 13, color: '#166534', marginBottom: 14 }}>📅 {visit.followUp}</div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>{visit.instructions.map((ins, i) => <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 6, lineHeight: 1.5 }}>{ins}</li>)}</ul>
        </div>
      )}
    </Modal>
  )
}

// ─── RECORD VISIT PAGE (full-page inline, matching screenshot) ────────────────
function RecordVisitPage({ patient, onBack }) {
  const visit = patient.visits[0]

  // ── Setup form state ───────────────────────────────────────────────────────
  const [provider, setProvider] = useState(`${patient.doctor.name} — ${patient.doctor.specialty}`)
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [customProvider, setCustomProvider] = useState('')
  const [showAddProvider, setShowAddProvider] = useState(false)
  const providers = [
    `${patient.doctor.name} — ${patient.doctor.specialty}`,
    'Other Provider — General Medicine',
  ]

  // ── Recording state ────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup')   // 'setup' | 'recording' | 'done' | 'error'
  const [seconds, setSeconds] = useState(0)
  const [micError, setMicError] = useState('')
  const [waveform, setWaveform] = useState(Array(40).fill(4))

  const timerRef = useRef(null)
  const mediaRef = useRef(null)
  const animRef = useRef(null)

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Animate waveform bars
  const animateWaveform = () => {
    setWaveform(Array.from({ length: 40 }, () => Math.random() * 36 + 4))
    animRef.current = requestAnimationFrame(() => setTimeout(animateWaveform, 100))
  }

  const startRecording = async () => {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = stream
      setPhase('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
      animateWaveform()
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone access was denied. Please allow microphone access in your browser settings and try again.')
      } else if (err.name === 'NotFoundError') {
        setMicError('No microphone found. Please connect a microphone and try again.')
      } else {
        setMicError(`Could not access microphone: ${err.message}`)
      }
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    cancelAnimationFrame(animRef.current)
    if (mediaRef.current) {
      mediaRef.current.getTracks().forEach(t => t.stop())
      mediaRef.current = null
    }
    setPhase('done')
  }

  useEffect(() => () => {
    clearInterval(timerRef.current)
    cancelAnimationFrame(animRef.current)
    if (mediaRef.current) mediaRef.current.getTracks().forEach(t => t.stop())
  }, [])

  // ── Centered card wrapper ──────────────────────────────────────────────────
  const cardStyle = {
    background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb',
    padding: '40px 44px', width: '100%', maxWidth: 560, margin: '0 auto',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  }

  // ── PHASE: Setup ──────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 24, minHeight: '60vh' }}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontWeight: 900, fontSize: 26, color: '#111827', marginBottom: 10 }}>Companion Scribe</div>
          <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6 }}>
            Record your doctor's visit to get a complete, understandable summary afterwards.
          </div>
        </div>

        {/* Healthcare Provider */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            Healthcare Provider
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              style={{
                flex: 1, padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: 13.5, color: '#111827', outline: 'none', cursor: 'pointer',
                fontFamily: 'inherit', background: '#fff',
              }}
            >
              {providers.map(p => <option key={p} value={p}>{p}</option>)}
              {customProvider && <option value={customProvider}>{customProvider}</option>}
            </select>
            <button
              onClick={() => setShowAddProvider(v => !v)}
              style={{
                width: 44, height: 44, border: '1.5px solid #e5e7eb', borderRadius: 10,
                background: '#fff', cursor: 'pointer', fontSize: 22, color: '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >+</button>
          </div>
          {showAddProvider && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <input
                value={customProvider}
                onChange={e => setCustomProvider(e.target.value)}
                placeholder="Dr. Name — Specialty"
                style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button onClick={() => { if (customProvider) { setProvider(customProvider); setShowAddProvider(false) } }}
                style={{ padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Add
              </button>
            </div>
          )}
        </div>

        {/* Visit Date */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            Visit Date
          </label>
          <input
            type="date" value={visitDate}
            onChange={e => setVisitDate(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10,
              fontSize: 13.5, color: '#111827', outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box', cursor: 'pointer',
            }}
            onFocus={e => e.target.style.borderColor = '#10b981'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Provider info row */}
        <div style={{
          background: '#f9fafb', borderRadius: 10, padding: '12px 16px',
          fontSize: 13, color: '#9ca3af', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontWeight: 700, color: '#374151' }}>MD</span>
          <span>·</span>
          <span>{patient.doctor.specialty}</span>
        </div>

        {/* Consent warning */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12,
          padding: '16px 18px', marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: '#92400e', marginBottom: 6 }}>
            Both parties must consent
          </div>
          <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, marginBottom: 8 }}>
            By pressing the button below, you confirm that both the healthcare provider and the patient have agreed to record this visit.
          </div>
          <span style={{ fontSize: 12.5, color: '#d97706', textDecoration: 'underline', cursor: 'pointer' }}>
            Privacy Policy
          </span>
        </div>

        {/* Mic error */}
        {micError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626', lineHeight: 1.5 }}>
            {micError}
          </div>
        )}

        {/* Start button */}
        <button
          onClick={startRecording}
          style={{
            width: '100%', padding: '16px', background: '#10b981', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.2,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#059669'}
          onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
        >
          Both Parties Consent — Start Recording
        </button>
      </div>
    </div>
  )

  // ── PHASE: Recording ──────────────────────────────────────────────────────
  if (phase === 'recording') return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 24, minHeight: '60vh' }}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#111827', marginBottom: 6 }}>Recording in Progress</div>
          <div style={{ fontSize: 13.5, color: '#9ca3af' }}>{provider}</div>
        </div>

        {/* Pulsing mic icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, background: '#fef2f2', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #fca5a5',
            animation: 'pulse 1.5s ease infinite',
          }}>
            <Mic size={34} color="#ef4444" />
          </div>
        </div>

        {/* Timer */}
        <div style={{ textAlign: 'center', fontSize: 42, fontWeight: 900, color: '#ef4444', marginBottom: 20, fontVariantNumeric: 'tabular-nums' }}>
          {fmt(seconds)}
        </div>

        {/* Live waveform */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 3, height: 52, marginBottom: 28, overflow: 'hidden',
        }}>
          {waveform.map((h, i) => (
            <div key={i} style={{
              width: 4, borderRadius: 4,
              height: `${h}px`,
              background: `hsl(${140 + i * 3}, 70%, ${50 + Math.random() * 10}%)`,
              transition: 'height 0.1s ease',
              flexShrink: 0,
            }} />
          ))}
        </div>

        {/* Status line */}
        <div style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.2s ease infinite' }} />
          Live · Speak clearly · Recording all audio
        </div>

        {/* Stop button */}
        <button
          onClick={stopRecording}
          style={{
            width: '100%', padding: '15px', background: '#ef4444', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
          onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
        >
          Stop Recording
        </button>
      </div>
    </div>
  )

  // ── PHASE: Done ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 24, minHeight: '60vh' }}>
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={36} color="#10b981" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#111827', marginBottom: 8 }}>Visit Recorded!</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Duration: <strong>{fmt(seconds)}</strong></div>
        <div style={{ fontSize: 13.5, color: '#9ca3af', marginBottom: 32, lineHeight: 1.6 }}>
          Shifa AI is processing your visit summary. You'll receive a WhatsApp message when it's ready.
        </div>

        {/* Summary card */}
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px 18px', textAlign: 'left', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Visit Summary</div>
          <div style={{ fontSize: 13, color: '#374151', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div><strong>Provider:</strong> {provider}</div>
            <div><strong>Date:</strong> {new Date(visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div><strong>Duration:</strong> {fmt(seconds)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onBack}
            style={{ flex: 1, padding: '13px', border: '1.5px solid #e5e7eb', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
            Back to Profile
          </button>
          <button onClick={() => { setPhase('setup'); setSeconds(0) }}
            style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 12, background: '#10b981', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            Record Another
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PROFILE PAGE CONTENT (original main view) ────────────────────────────────
function ProfileContent({ patient, visit, setModal, setVisitExpanded, visitExpanded, setActiveTab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Patient Profile Card */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 20 }}>
        <img src={patient.avatar} alt={patient.name} onError={e => { e.target.style.display = 'none' }}
          style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #d1fae5', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#111827', marginBottom: 4 }}>{patient.name}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>{patient.gender}, {patient.age} y.o.</div>
          <div style={{ fontSize: 12.5, color: '#9ca3af' }}>{patient.email}</div>
        </div>
        <ChevronRight size={18} color="#d1d5db" />
      </div>

      {/* Visit History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Visit History</div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Ask
          </button>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ background: '#4f46e5', borderRadius: 8, padding: '6px 10px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>{visit.date.split(' ')[0]}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{visit.date.split(' ')[1]}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>{visit.type}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <img src={patient.doctor.avatar} alt={patient.doctor.name} onError={e => e.target.style.display = 'none'}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{patient.doctor.name}</div>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{patient.doctor.specialty}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{visit.diagnosis}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Contact</button>
              <button onClick={() => setModal('visit')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight size={18} color="#d1d5db" /></button>
            </div>
          </div>
          {visitExpanded && (
            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{visit.notes}</div>
            </div>
          )}
          <button onClick={() => setVisitExpanded(e => !e)} style={{ width: '100%', padding: '10px', background: '#f9fafb', border: 'none', borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {visitExpanded ? <><ChevronLeft size={12} style={{ transform: 'rotate(90deg)' }} /> Show less</> : <><ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} /> Show visit notes</>}
          </button>
        </div>
      </div>

      {/* Record New Visit */}
      <button onClick={() => setModal('record')} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
        onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
      ><Circle size={10} fill="#fff" color="#fff" /> Record New Visit</button>

      {/* Health Record + Reference */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => setActiveTab('My Health')}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button onClick={e => { e.stopPropagation(); setActiveTab('My Health') }} style={askBtn()}><CheckCircle2 size={12} /> Ask</button>
          </div>
          <div style={{ width: 44, height: 44, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <FileText size={22} color="#10b981" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 6 }}>Health Record</div>
          <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{patient.labResults.length} entries</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => setModal('reference')}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button onClick={e => { e.stopPropagation(); setModal('reference') }} style={askBtn()}><CheckCircle2 size={12} /> Ask</button>
          </div>
          <div style={{ width: 44, height: 44, background: '#faf5ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <BookOpen size={22} color="#7c3aed" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 6 }}>Reference</div>
          <span style={{ background: '#faf5ff', color: '#7c3aed', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{patient.references.length} references</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', lineHeight: 1.7, marginTop: 8 }}>
        All clinical scenarios, patient data, and medical records displayed in this application are entirely fictional,
        created for demonstration purposes only, and do not depict any real individual or actual medical encounter.
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af' }}>
        Built for the <strong>Shifa Health</strong> Demo · Powered by Claude AI
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DemoPatientView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = SCENARIOS[id] || SCENARIOS['pat-001']
  const visit = patient.visits[0]

  const [activeTab, setActiveTab] = useState('Profile')
  const [modal, setModal] = useState(null)
  const [chatOpen, setChatOpen] = useState(true)
  const [chatExpanded, setChatExpanded] = useState(false)
  const [followUpVisible, setFollowUpVisible] = useState(true)
  const [visitExpanded, setVisitExpanded] = useState(false)

  const tabs = ['Profile', 'My Health', 'Reference', 'Record Visit']

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setModal(null)
  }

  const chatContext = activeTab === 'My Health' ? 'health' : activeTab === 'Reference' ? 'reference' : 'default'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif", background: '#f3f4f6' }}>

      {/* Demo Banner */}
      <div style={{ background: '#f59e0b', color: '#78350f', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Monitor size={16} /> Demo Mode — {patient.name}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/demo/doctor/d1')} style={{ background: '#fff', border: 'none', color: '#92400e', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Doctor Panel</button>
          <button onClick={() => navigate('/demo/scenarios')} style={{ background: '#92400e', border: 'none', color: '#fff', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Switch Scenario</button>
        </div>
      </div>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', flexShrink: 0, height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 28 }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: '#10b981', letterSpacing: -0.5 }}>Shifa</span>
          <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>Patient Panel</span>
        </div>
        <div style={{ display: 'flex', flex: 1, height: '100%' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => handleTabClick(tab)} style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === tab ? '#10b981' : '#6b7280',
              fontWeight: activeTab === tab ? 700 : 500, fontSize: 13.5,
              padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              height: '100%', marginBottom: -1, transition: 'color 0.15s',
            }}>
              {tab === 'Reference' && <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />}
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <img src={patient.avatar} alt={patient.name} onError={e => e.target.style.display = 'none'}
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d1fae5' }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{patient.name}</span>
          <ChevronRight size={14} color="#9ca3af" style={{ transform: 'rotate(90deg)' }} />
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left scroll area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: 24 }}>

            {/* My Health inline view */}
            {activeTab === 'My Health' ? (
              <MyHealthPage
                patient={patient}
                visit={visit}
                onBack={() => setActiveTab('Profile')}
                onAsk={() => setChatOpen(true)}
              />
            ) : activeTab === 'Reference' ? (
              <ReferencePage
                patient={patient}
                onBack={() => setActiveTab('Profile')}
                onAsk={() => setChatOpen(true)}
              />
            ) : activeTab === 'Record Visit' ? (
              <RecordVisitPage
                patient={patient}
                onBack={() => setActiveTab('Profile')}
              />
            ) : (
              <>
                <ProfileContent
                  patient={patient}
                  visit={visit}
                  setModal={setModal}
                  setVisitExpanded={setVisitExpanded}
                  visitExpanded={visitExpanded}
                  setActiveTab={setActiveTab}
                />
                {/* Follow-up Banner */}
                {followUpVisible && (
                  <div style={{ background: '#fff', border: '1px solid #e0e7ff', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    <div style={{ width: 36, height: 36, background: '#eef2ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={18} color="#6366f1" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Follow-up Appointment Requested</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{patient.doctor.name} — {visit.followUp}</div>
                    </div>
                    <button onClick={() => setModal('schedule')} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Schedule</button>
                    <button onClick={() => setFollowUpVisible(false)} style={iconBtn}><X size={16} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* AI Chat Panel — hidden on Record Visit */}
        {chatOpen && activeTab !== 'Record Visit' && (
          <AIChatPanel
            patient={patient}
            context={chatContext}
            onClose={() => setChatOpen(false)}
            isExpanded={chatExpanded}
            onToggleExpand={() => setChatExpanded(e => !e)}
          />
        )}

        {/* Chat re-open fab — hidden on Record Visit */}
        {!chatOpen && activeTab !== 'Record Visit' && (
          <button onClick={() => setChatOpen(true)} style={{ position: 'fixed', bottom: 24, right: 24, background: '#10b981', color: '#fff', border: 'none', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.4)', zIndex: 100 }}>
            <CheckCircle2 size={22} />
          </button>
        )}
      </div>

      {/* Modals */}
      {modal === 'schedule' && <ScheduleModal doctor={patient.doctor} followUp={visit.followUp} onClose={() => setModal(null)} />}
      {modal === 'visit' && <VisitDetailModal visit={visit} doctor={patient.doctor} onClose={() => setModal(null)} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4) } 50% { box-shadow: 0 0 0 12px rgba(239,68,68,0) } }
      `}</style>
    </div>
  )
}
