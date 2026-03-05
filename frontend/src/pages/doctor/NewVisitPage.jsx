/**
 * NewVisitPage.jsx — Create New Visit
 * Route: /doctor/visits/new
 * Layout: DoctorLayout
 *
 * Flow:
 *   1. Select patient (search existing or quick-add new)
 *   2. Fill visit form: chief complaint, SOAP notes, diagnosis, medications, follow-up date
 *   3. On submit → POST /api/v1/visits → AI processing begins
 *   4. Redirect to VisitDetailPage which shows AI progress
 *
 * Sub-components:
 *   - PatientSearch (reusable search/select widget)
 *   - NewVisitForm (the SOAP note + prescription form)
 *   - AIProcessingStatus (polling spinner shown after submit)
 */

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UserPlus, ArrowLeft, ChevronRight } from 'lucide-react'

import DoctorLayout            from '@/components/layout/DoctorLayout'
import PageHeader              from '@/components/common/PageHeader'
import PatientSearch           from '@/components/doctor/PatientSearch'
import NewVisitForm            from '@/components/forms/NewVisitForm'
import PatientQuickAddForm     from '@/components/forms/PatientQuickAddForm'
import Button                 from '@/components/ui/Button'
import Modal                   from '@/components/ui/Modal'
import Avatar                  from '@/components/ui/Avatar'
import Badge                   from '@/components/ui/Badge'

export default function NewVisitPage() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const preloadedId   = params.get('patientId')

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedPatient, setSelectedPatient]   = useState(null)
  const [showSearch, setShowSearch]             = useState(!preloadedId)
  const [showAddPatient, setShowAddPatient]      = useState(false)
  const [step, setStep]                         = useState(preloadedId ? 2 : 1)
  // step 1 = select patient
  // step 2 = fill visit form

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setShowSearch(false)
    setStep(2)
  }

  const handleVisitCreated = (visit) => {
    // Navigate to visit detail which polls AI status
    navigate(`/doctor/visits/${visit.id}`, { state: { justCreated: true } })
  }

  return (
    <DoctorLayout>
      <PageHeader
        title="New Visit"
        subtitle="Record a patient consultation — Shifa will generate an AI summary and send it to the patient."
        backHref="/doctor/dashboard"
      />

      <div className="p-4 sm:p-6 max-w-2xl">

        {/* ── Breadcrumb pills ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className={`font-semibold ${step === 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
            1. Select Patient
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className={`font-semibold ${step === 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
            2. Visit Notes
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-semibold text-gray-400">3. AI Summary</span>
        </div>

        {/* ── Step 1: Patient selection ─────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Select a patient</h2>
            <p className="text-sm text-gray-500 mb-5">
              Search by name or phone number. Or add a new patient.
            </p>

            <PatientSearch
              autoFocus
              onSelect={handlePatientSelect}
              className="mb-4"
            />

            <div className="border-t border-gray-100 pt-4 mt-2">
              <p className="text-sm text-gray-400 mb-3">New patient?</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddPatient(true)}
              >
                <UserPlus size={14} className="mr-1.5" />
                Add new patient
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Visit form ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Selected patient banner */}
            {selectedPatient && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                    size="sm"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{selectedPatient.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPatient.preferredLanguage && (
                    <Badge variant="language" label={selectedPatient.preferredLanguage} />
                  )}
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-emerald-600 font-semibold hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* The main form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <NewVisitForm
                patientId={selectedPatient?.id ?? preloadedId}
                onSuccess={handleVisitCreated}
                onCancel={() => navigate(-1)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Add patient modal ────────────────────────────────────────────── */}
      <Modal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        title="Add New Patient"
      >
        <PatientQuickAddForm
          onSuccess={(patient) => {
            setShowAddPatient(false)
            handlePatientSelect(patient)
          }}
          onCancel={() => setShowAddPatient(false)}
        />
      </Modal>
    </DoctorLayout>
  )
}
