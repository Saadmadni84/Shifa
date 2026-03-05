/**
 * PatientsPage.jsx — Doctor's Patient List
 * Route: /doctor/patients
 * Layout: DoctorLayout
 *
 * Features:
 *   - Search by name or phone (debounced)
 *   - Infinite scroll / "Load more" pagination
 *   - Patient cards with last visit info and preferred language badge
 *   - Quick actions: New Visit for patient, View Patient
 *   - Add new patient modal
 *
 * Data:
 *   GET /api/v1/patients?search=&page=&size=20   (usePatients hook)
 *   POST /api/v1/patients                        (create patient)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, SlidersHorizontal } from 'lucide-react'

import DoctorLayout           from '@/components/layout/DoctorLayout'
import PageHeader             from '@/components/common/PageHeader'
import PatientCard            from '@/components/doctor/PatientCard'
import { Button }             from '@/components/ui/Button'
import { Input }              from '@/components/ui/Input'
import { SkeletonCard }       from '@/components/ui/Spinner'
import EmptyState             from '@/components/ui/EmptyState'
import Modal                  from '@/components/ui/Modal'
import { PatientQuickAddForm } from '@/components/forms/PatientQuickAddForm'

import { usePatients }        from '@/hooks/usePatients'

// ─── Language filter options ──────────────────────────────────────────────────
const LANGUAGE_OPTIONS = [
  { value: '',   label: 'All Languages' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'en', label: 'English' },
]

export default function PatientsPage() {
  const navigate = useNavigate()

  const [showAddPatient, setShowAddPatient] = useState(false)
  const [langFilter, setLangFilter]         = useState('')
  const [showFilters, setShowFilters]       = useState(false)

  const {
    patients,
    total,
    search,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleSearch,
    createPatient,
    isCreating,
  } = usePatients({ language: langFilter })

  return (
    <DoctorLayout>
      <PageHeader
        title="Patients"
        subtitle={total ? `${total} patients registered` : 'Your patient list'}
        action={
          <Button size="sm" onClick={() => setShowAddPatient(true)}>
            <Plus size={15} className="mr-1.5" />
            Add Patient
          </Button>
        }
      />

      <div className="p-4 sm:p-6 max-w-4xl">

        {/* ── Search + filters bar ──────────────────────────────────────── */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              langFilter
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filter</span>
            {langFilter && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
          </button>
        </div>

        {/* ── Language filter dropdown ──────────────────────────────────── */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLangFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  langFilter === opt.value
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Patient grid ──────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} className="h-28" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon="⚠️"
            title="Could not load patients"
            description="Please check your connection and refresh."
          />
        ) : patients.length === 0 ? (
          <EmptyState
            icon="👥"
            title={search ? 'No patients found' : 'No patients yet'}
            description={
              search
                ? `No results for "${search}". Try a different name or phone number.`
                : 'Add your first patient to get started.'
            }
            action={
              !search && (
                <Button size="sm" onClick={() => setShowAddPatient(true)}>
                  <Plus size={14} className="mr-1" /> Add First Patient
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                  onNewVisit={() =>
                    navigate(`/doctor/visits/new?patientId=${patient.id}`)
                  }
                />
              ))}
            </div>

            {/* Load more */}
            {hasNextPage && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={fetchNextPage}
                  loading={isFetchingNextPage}
                >
                  Load more patients
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add patient modal ────────────────────────────────────────────── */}
      <Modal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        title="Add New Patient"
      >
        <PatientQuickAddForm
          onSuccess={() => setShowAddPatient(false)}
          onCancel={() => setShowAddPatient(false)}
        />
      </Modal>
    </DoctorLayout>
  )
}
