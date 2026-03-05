/**
 * PatientDetailPage.jsx — Patient Profile
 * Route: /doctor/patients/:id
 * Layout: DoctorLayout
 *
 * Sections:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Patient header: avatar, name, phone, language      │
 *   │  Quick action: New Visit for this patient           │
 *   │  Tabs: Overview | Visits | Vitals | Consents        │
 *   │                                                      │
 *   │  Overview tab:                                       │
 *   │    - Patient details card (editable)                 │
 *   │    - Last visit summary                              │
 *   │    - VitalsGrid (latest readings)                    │
 *   │    - Medicines on record                             │
 *   │                                                      │
 *   │  Visits tab:                                         │
 *   │    - Full visit history table                        │
 *   │    - Each row: date, diagnosis, AI status, WA status │
 *   │                                                      │
 *   │  Vitals tab:                                         │
 *   │    - BP, Heart Rate, Weight, Blood Sugar charts      │
 *   │                                                      │
 *   │  Consents tab:                                       │
 *   │    - Data processing, WhatsApp comms consent records │
 *   └─────────────────────────────────────────────────────┘
 *
 * Data:
 *   GET /api/v1/patients/:id              (usePatient hook)
 *   GET /api/v1/patients/:id/visits       (usePatientVisits hook)
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit3, Phone, Globe, Calendar, ChevronRight } from 'lucide-react'

import DoctorLayout       from '@/components/layout/DoctorLayout'
import PageHeader         from '@/components/common/PageHeader'
import Avatar             from '@/components/ui/Avatar'
import Badge, { LanguageBadge } from '@/components/ui/Badge'
import Tabs               from '@/components/ui/Tabs'
import { Button }         from '@/components/ui/Button'
import { SkeletonCard }   from '@/components/ui/Spinner'
import EmptyState         from '@/components/ui/EmptyState'
import Modal              from '@/components/ui/Modal'

// Patient component imports
import VitalsGrid         from '@/components/patient/VitalsGrid'
import { VitalCard }      from '@/components/patient/VitalCard'
import FollowUpReminder   from '@/components/patient/FollowUpReminder'

// Chart imports
import HeartRateChart     from '@/components/charts/HeartRateChart'
import BloodPressureChart from '@/components/charts/BloodPressureChart'
import WeightChart        from '@/components/charts/WeightChart'
import BloodSugarChart    from '@/components/charts/BloodSugarChart'

// Visit row
import VisitRow           from '@/components/doctor/VisitRow'
import { AIStatusBadge }  from '@/components/doctor/AIStatusBadge'
import { WhatsAppStatusBadge } from '@/components/doctor/WhatsAppStatusBadge'

import { usePatient, usePatientVisits } from '@/hooks/usePatients'

const PATIENT_TABS = [
  { id: 'overview', label: 'Overview'  },
  { id: 'visits',   label: 'Visits'    },
  { id: 'vitals',   label: 'Vitals'    },
  { id: 'consents', label: 'Consents'  },
]

// ─── Consent row ─────────────────────────────────────────────────────────────
function ConsentRow({ type, label, granted, grantedAt }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        {grantedAt && (
          <div className="text-xs text-gray-400 mt-0.5">
            {granted ? 'Granted' : 'Withdrawn'} on{' '}
            {new Date(grantedAt).toLocaleDateString('en-IN')}
          </div>
        )}
      </div>
      <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
        granted
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}>
        {granted ? 'Granted' : 'Not given'}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatientDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [showEdit, setShowEdit]   = useState(false)

  const { patient, isLoading, isError }  = usePatient(id)
  const { visits, isLoading: visitsLoading } = usePatientVisits(id)

  if (isLoading) {
    return (
      <DoctorLayout>
        <div className="p-6 space-y-4">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-80" />
        </div>
      </DoctorLayout>
    )
  }

  if (isError || !patient) {
    return (
      <DoctorLayout>
        <EmptyState
          icon="⚠️"
          title="Patient not found"
          description="This patient record doesn't exist or you don't have access."
          action={<Button onClick={() => navigate('/doctor/patients')}>Back to Patients</Button>}
          className="m-6"
        />
      </DoctorLayout>
    )
  }

  const fullName      = `${patient.firstName} ${patient.lastName}`
  const lastVisit     = visits?.[0]
  const totalVisits   = visits?.length ?? 0

  return (
    <DoctorLayout>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        backHref="/doctor/patients"
        title={
          <div className="flex items-center gap-3">
            <Avatar name={fullName} size="md" />
            <div>
              <div className="font-extrabold text-gray-900 text-lg leading-tight">{fullName}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <Phone size={11} className="text-gray-400" />
                <span className="text-xs text-gray-400">{patient.phone}</span>
                {patient.preferredLanguage && (
                  <LanguageBadge code={patient.preferredLanguage} />
                )}
              </div>
            </div>
          </div>
        }
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
              <Edit3 size={14} className="mr-1.5" /> Edit
            </Button>
            <Button size="sm" onClick={() => navigate(`/doctor/visits/new?patientId=${id}`)}>
              <Plus size={14} className="mr-1.5" /> New Visit
            </Button>
          </div>
        }
      />

      {/* ── Quick stats bar ──────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-extrabold text-gray-900">{totalVisits}</div>
          <div className="text-xs text-gray-400">Total Visits</div>
        </div>
        <div>
          <div className="font-extrabold text-gray-900">
            {lastVisit ? new Date(lastVisit.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
          </div>
          <div className="text-xs text-gray-400">Last Visit</div>
        </div>
        <div>
          <div className="font-extrabold text-gray-900">
            {patient.age ? `${patient.age}y` : '—'}
          </div>
          <div className="text-xs text-gray-400">Age</div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4">
        <Tabs tabs={PATIENT_TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="p-4 sm:p-6 max-w-3xl">

        {/* ══ Overview ═══════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Patient info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Patient Details</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <InfoRow label="Full Name" value={fullName} />
                <InfoRow label="Phone" value={patient.phone} />
                <InfoRow label="Date of Birth" value={
                  patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN')
                    : 'Not set'
                } />
                <InfoRow label="Gender" value={patient.gender ?? 'Not specified'} />
                <InfoRow label="Blood Group" value={patient.bloodGroup ?? '—'} />
                <InfoRow label="Language" value={patient.preferredLanguage ?? 'English'} />
                <InfoRow label="City" value={patient.city ?? '—'} />
                <InfoRow label="ABHA ID" value={patient.abhaId ?? '—'} />
              </div>
            </div>

            {/* Last visit summary */}
            {lastVisit && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Last Visit</h3>
                  <button
                    onClick={() => navigate(`/doctor/visits/${lastVisit.id}`)}
                    className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    View full <ChevronRight size={12} />
                  </button>
                </div>
                <VisitRow visit={lastVisit} compact />
              </div>
            )}

            {/* Vitals grid */}
            {patient.latestVitals && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Latest Vitals</h3>
                <VitalsGrid vitals={patient.latestVitals} />
              </div>
            )}

            {/* Follow up */}
            {lastVisit?.followUpDate && (
              <FollowUpReminder followUpDate={lastVisit.followUpDate} doctorName={lastVisit.doctor?.name} />
            )}
          </div>
        )}

        {/* ══ Visits ═════════════════════════════════════════════════════ */}
        {activeTab === 'visits' && (
          <div>
            {visitsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} className="h-16" />)}
              </div>
            ) : !visits?.length ? (
              <EmptyState
                icon="🩺"
                title="No visits yet"
                description="This patient has no visits recorded."
                action={
                  <Button size="sm" onClick={() => navigate(`/doctor/visits/new?patientId=${id}`)}>
                    <Plus size={14} className="mr-1" /> New Visit
                  </Button>
                }
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {visits.map((visit) => (
                    <VisitRow
                      key={visit.id}
                      visit={visit}
                      onClick={() => navigate(`/doctor/visits/${visit.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ Vitals charts ══════════════════════════════════════════════ */}
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <BloodPressureChart patientId={id} />
            <HeartRateChart patientId={id} />
            <BloodSugarChart patientId={id} />
            <WeightChart patientId={id} />
          </div>
        )}

        {/* ══ Consents ═══════════════════════════════════════════════════ */}
        {activeTab === 'consents' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Consent Records</h3>
            <p className="text-xs text-gray-400 mb-4">
              Recorded at time of patient registration. Required under DPDP Act 2023.
            </p>
            <ConsentRow
              type="DATA_PROCESSING"
              label="Data Processing Consent"
              granted={patient.consents?.dataProcessing ?? false}
              grantedAt={patient.consents?.dataProcessingAt}
            />
            <ConsentRow
              type="WHATSAPP_COMMS"
              label="WhatsApp Communication Consent"
              granted={patient.consents?.whatsappComms ?? false}
              grantedAt={patient.consents?.whatsappCommsAt}
            />
            <ConsentRow
              type="ABDM"
              label="ABDM Health Record Sharing"
              granted={patient.consents?.abdm ?? false}
              grantedAt={patient.consents?.abdmAt}
            />
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}

// ─── Small helper ─────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className="font-semibold text-gray-800 text-sm">{value}</div>
    </div>
  )
}
