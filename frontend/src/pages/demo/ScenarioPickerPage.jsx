/**
 * ScenarioPickerPage.jsx — Demo Scenario Selector
 * ─────────────────────────────────────────────────────────────────────────────
 * Matches the PostVisit.ai "Select Demo Scenario" layout adapted for Shifa:
 *  • 12 Indian patient scenarios across multiple specialties
 *  • 4 visible by default, 8 revealed in animated expand
 *  • Specialty filter tabs (Cardiology, Endocrinology, Pulmonology…)
 *  • Clicking a card navigates to /demo/patient/:id
 *  • Fetches from GET /api/demo/scenarios (or uses inline mock while backend loads)
 *
 * Place at: src/pages/demo/ScenarioPickerPage.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'

// ─── Language badge colours ────────────────────────────────────────────────────
const LANG_BADGE = {
  HI:  { bg: '#fef9c3', text: '#713f12', label: 'HI' },
  TA:  { bg: '#ede9fe', text: '#4c1d95', label: 'TA' },
  EN:  { bg: '#dcfce7', text: '#14532d', label: 'EN' },
  TE:  { bg: '#fce7f3', text: '#831843', label: 'TE' },
  BN:  { bg: '#e0f2fe', text: '#0c4a6e', label: 'BN' },
  GU:  { bg: '#fff7ed', text: '#7c2d12', label: 'GU' },
  MR:  { bg: '#f0fdf4', text: '#14532d', label: 'MR' },
  KN:  { bg: '#fdf4ff', text: '#581c87', label: 'KN' },
}

// ─── Static demo data (mirrors what the backend returns) ──────────────────────
// Replace with API fetch in production; kept inline so the page works offline
const DEMO_SCENARIOS = [
  {
    id: 'pat-001',
    number: '01',
    name: 'Arjun Sharma',
    age: 52,
    gender: 'M',
    bmi: 27.4,
    specialty: 'Cardiology',
    language: 'HI',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf0NCwQJT3J2O2DUqIaQcM0dxWX3gzNO0UWG6DWqhNFA&s',
    chiefComplaint: 'Heart palpitations and irregular heartbeat for 3 weeks. EKG shows PVCs. Started on Propranolol 40mg BID.',
  },
  {
    id: 'pat-002',
    number: '02',
    name: 'Priya Patel',
    age: 45,
    gender: 'F',
    bmi: 24.1,
    specialty: 'Endocrinology',
    language: 'GU',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdYReKbWFu1Wsk6tJGu8oNClbczhPceg252OlvyXn5Kw&s=10',
    chiefComplaint: 'Poorly controlled Type 2 Diabetes. HbA1c at 8.2%. Metformin dose adjustment and dietary counselling.',
  },
  {
    id: 'pat-003',
    number: '03',
    name: 'Ravi Kumar',
    age: 38,
    gender: 'M',
    bmi: 22.8,
    specialty: 'Pulmonology',
    language: 'KN',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT536fn6P6l1FY4z83ZUwV7DJFgFfTNEI68ITFGIHumuQ&s=10',
    chiefComplaint: 'Moderate persistent asthma with nocturnal symptoms. Inhaler technique corrected, added ICS-LABA.',
  },
  {
    id: 'pat-004',
    number: '04',
    name: 'Sunita Devi',
    age: 60,
    gender: 'F',
    bmi: 30.2,
    specialty: 'Cardiology',
    language: 'HI',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSWd5GELZp3_lzFcBEH2n_Pwlohigot0O6NLV8BTwY9A&s=10',
    chiefComplaint: 'Hypertension follow-up. BP 158/96. Amlodipine 5mg added; sodium restriction counselled.',
  },
  {
    id: 'pat-005',
    number: '05',
    name: 'Mohammed Iqbal',
    age: 47,
    gender: 'M',
    bmi: 26.7,
    specialty: 'Gastroenterology',
    language: 'TE',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWqeEyduSVO9xFx8FhhaBNwbkaxbV_jUd5UKWAByrHWg&s=10',
    chiefComplaint: 'Chronic GERD with erosive esophagitis. Upper endoscopy done, PPI therapy escalated.',
  },
  {
    id: 'pat-006',
    number: '06',
    name: 'Kavitha Nair',
    age: 34,
    gender: 'F',
    bmi: 21.3,
    specialty: 'Endocrinology',
    language: 'TA',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8iiBd_R-fK0sJbv2PQf5T4uFeqJHRfPzs-w_qAubUQw&s=10',
    chiefComplaint: 'Hypothyroidism follow-up. TSH 7.8 mIU/L. Levothyroxine dose titrated to 75mcg.',
  },
  {
    id: 'pat-007',
    number: '07',
    name: 'Deepak Mishra',
    age: 63,
    gender: 'M',
    bmi: 29.1,
    specialty: 'Orthopedics',
    language: 'HI',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWWJCz927mYLI4qTEP-cl5uKaOXX1ofVxDEMK48kKwYg&s=10',
    chiefComplaint: 'Bilateral knee osteoarthritis Grade II. Physiotherapy initiated, intra-articular injection planned.',
  },
  {
    id: 'pat-008',
    number: '08',
    name: 'Lakshmi Reddy',
    age: 55,
    gender: 'F',
    bmi: 28.5,
    specialty: 'Cardiology',
    language: 'TE',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBKnWg6fymzckZcxTF0hG2r_V_kn7zUwatcjRDN1UH1g&s=10',
    chiefComplaint: 'Post-MI follow-up at 6 weeks. Echo EF 48%. Dual antiplatelet and statin therapy continued.',
  },
  {
    id: 'pat-009',
    number: '09',
    name: 'Suresh Babu',
    age: 41,
    gender: 'M',
    bmi: 23.6,
    specialty: 'Neurology',
    language: 'KN',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd7TRxLUO7YRhFpjRIz85RTCuw64qbIrKMlytY-rxzBQ&s=10',
    chiefComplaint: 'Migraine with aura, 6 attacks/month. Topiramate initiated for prophylaxis; trigger diary advised.',
  },
  {
    id: 'pat-010',
    number: '10',
    name: 'Anita Mehta',
    age: 50,
    gender: 'F',
    bmi: 25.9,
    specialty: 'Rheumatology',
    language: 'GU',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVVEDWCzasUsaNhL7evaeKrcA18A4qfsdOajDZDFqG9A&s=10',
    chiefComplaint: 'Rheumatoid arthritis with elevated CRP. Methotrexate 15mg/week started, folic acid supplement.',
  },
  {
    id: 'pat-011',
    number: '11',
    name: 'Ramesh Nair',
    age: 68,
    gender: 'M',
    bmi: 31.0,
    specialty: 'Pulmonology',
    language: 'TA',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWof5UUrRjo3_lqNoyznLB8dD1mZiIP-d1Evtkwh9CmA&s=10',
    chiefComplaint: 'COPD exacerbation, GOLD Stage II. Short course of oral steroids and antibiotics. LAMA added.',
  },
  {
    id: 'pat-012',
    number: '12',
    name: 'Geeta Singh',
    age: 29,
    gender: 'F',
    bmi: 19.8,
    specialty: 'Endocrinology',
    language: 'HI',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuRfCF3SYiB0j__Qxs4d-G9y3dPvAtpUHEV7uYYL_WbQ&s',
    chiefComplaint: 'PCOS with irregular cycles. Metformin 500mg OD initiated; low GI diet plan provided.',
  },
]

const ALL_SPECIALTIES = ['All', 'Cardiology', 'Endocrinology', 'Pulmonology', 'Gastroenterology', 'Neurology', 'Orthopedics', 'Rheumatology']

// ─── Avatar with fallback initials ────────────────────────────────────────────
function Avatar({ src, name, gender }) {
  const [errored, setErrored] = useState(false)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)

  if (errored) {
    return (
      <div style={{
        width: '100%', height: '100%', background: '#d1fae5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, fontWeight: 700, color: '#065f46', letterSpacing: 1,
      }}>
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
    />
  )
}

// ─── Scenario Card ─────────────────────────────────────────────────────────────
function ScenarioCard({ scenario, onClick }) {
  const [hovered, setHovered] = useState(false)
  const badge = LANG_BADGE[scenario.language] || LANG_BADGE.EN

  return (
    <div
      onClick={() => onClick(scenario.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: hovered ? '2px solid #10b981' : '2px solid #e5e7eb',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        boxShadow: hovered ? '0 8px 28px rgba(16,185,129,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo area */}
      <div style={{ position: 'relative', height: 220, background: '#f3f4f6', flexShrink: 0 }}>
        <Avatar src={scenario.avatar} name={scenario.name} gender={scenario.gender} />

        {/* Language badge top-right */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: badge.bg, color: badge.text,
          fontSize: 11, fontWeight: 700, padding: '3px 8px',
          borderRadius: 6, letterSpacing: 0.5,
        }}>
          {badge.label}
        </div>

        {/* Specialty chip bottom-left */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(4px)',
          color: '#374151', fontSize: 11, fontWeight: 600,
          padding: '3px 10px', borderRadius: 6,
        }}>
          {scenario.specialty}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 2 }}>
          {scenario.number} — {scenario.name}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>
          {scenario.age}{scenario.gender} · BMI {scenario.bmi}
        </div>
        <div style={{
          fontSize: 12.5, color: '#10b981', fontStyle: 'italic', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', flex: 1,
        }}>
          {scenario.chiefComplaint}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ScenarioPickerPage() {
  const navigate = useNavigate()
  const [activeSpecialty, setActiveSpecialty] = useState('All')
  const [expanded, setExpanded] = useState(false)
  const [scenarios, setScenarios] = useState(DEMO_SCENARIOS)
  const [loading, setLoading] = useState(false)

  // Optionally fetch from backend (falls back to static data on error)
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/demo/scenarios')
        if (!res.ok) throw new Error('backend not available')
        const data = await res.json()
        if (data && data.length > 0) {
          // Map backend shape to our card shape
          const mapped = data.map((p, i) => ({
            id: p.id,
            number: String(i + 1).padStart(2, '0'),
            name: p.name,
            age: p.age,
            gender: p.gender || 'M',
            bmi: p.bmi || 25.0,
            specialty: p.condition || 'General',
            language: p.preferredLanguage || 'EN',
            avatar: `https://randomuser.me/api/portraits/${(p.gender || 'M') === 'F' ? 'women' : 'men'}/${(i + 1) * 7}.jpg`,
            chiefComplaint: p.visits?.[0]?.chiefComplaint || p.condition || 'Visit details available.',
          }))
          setScenarios(mapped)
        }
      } catch {
        // Use static DEMO_SCENARIOS as fallback — already set
      } finally {
        setLoading(false)
      }
    }
    fetchScenarios()
  }, [])

  // Specialty counts
  const specialtyCounts = useMemo(() => {
    const counts = {}
    scenarios.forEach(s => {
      counts[s.specialty] = (counts[s.specialty] || 0) + 1
    })
    return counts
  }, [scenarios])

  // Filtered scenarios
  const filtered = useMemo(() => {
    if (activeSpecialty === 'All') return scenarios
    return scenarios.filter(s => s.specialty === activeSpecialty)
  }, [scenarios, activeSpecialty])

  const visible = filtered.slice(0, expanded ? filtered.length : 4)
  const hiddenCount = filtered.length - 4

  const handleCardClick = (patientId) => {
    navigate(`/demo/patient/${patientId}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
      paddingBottom: 60,
    }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '52px 24px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <CheckCircle2 size={28} color="#10b981" strokeWidth={2.5} />
          <h1 style={{
            fontSize: 30, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: -0.5,
          }}>
            Select Demo Scenario
          </h1>
        </div>
        <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          Select a patient to start a demo session. Each scenario loads a realistic visit transcript
          and clinical data relevant to the individual pathology.
        </p>
      </div>

      {/* ── Card Grid ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 15 }}>
            Loading scenarios…
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))',
              gap: 20,
            }}>
              {visible.map((s) => (
                <ScenarioCard key={s.id} scenario={s} onClick={handleCardClick} />
              ))}
            </div>

            {/* ── Specialty Filter ─────────────────────────────────────────── */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              gap: 8, marginTop: 32, paddingTop: 24,
              borderTop: '1px solid #e5e7eb',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, marginRight: 4 }}>
                SPECIALTY:
              </span>
              {ALL_SPECIALTIES.map(spec => {
                const count = spec === 'All' ? scenarios.length : (specialtyCounts[spec] || 0)
                const isActive = activeSpecialty === spec
                const hasData = spec === 'All' || count > 0

                return (
                  <button
                    key={spec}
                    onClick={() => {
                      if (!hasData) return
                      setActiveSpecialty(spec)
                      setExpanded(false)
                    }}
                    style={{
                      padding: '5px 14px', borderRadius: 999,
                      border: isActive ? '2px solid #10b981' : '2px solid #e5e7eb',
                      background: isActive ? '#10b981' : '#fff',
                      color: isActive ? '#fff' : hasData ? '#374151' : '#d1d5db',
                      fontSize: 13, fontWeight: 600,
                      cursor: hasData ? 'pointer' : 'default',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {spec}
                    {count > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: isActive ? 'rgba(255,255,255,0.8)' : '#9ca3af',
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── Show More / Less ─────────────────────────────────────────── */}
            {hiddenCount > 0 && (
              <div style={{ marginTop: 24 }}>
                <button
                  onClick={() => setExpanded(e => !e)}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    fontSize: 14, fontWeight: 600, color: '#374151',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {expanded
                    ? <><ChevronUp size={16} /> Show fewer scenarios</>
                    : <><ChevronDown size={16} /> Show {hiddenCount} more scenario{hiddenCount !== 1 ? 's' : ''} ∨</>
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer disclaimer ─────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center', marginTop: 48, padding: '0 24px',
        fontSize: 11.5, color: '#9ca3af', maxWidth: 700, margin: '48px auto 0', lineHeight: 1.7,
      }}>
        All patient photographs are AI-generated and do not depict real individuals. Clinical scenarios
        span cardiology, endocrinology, gastroenterology, and pulmonology. All names, demographics,
        and medical data are entirely fictional.
      </div>
    </div>
  )
}
