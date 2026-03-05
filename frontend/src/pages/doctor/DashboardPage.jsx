/**
 * DashboardPage.jsx — Doctor Home Dashboard
 * Route: /doctor/dashboard
 * Layout: DoctorLayout (sidebar + topbar)
 *
 * Sections:
 *   1. StatsGrid    — total patients, visits today, AI pending, WhatsApp sent
 *   2. Quick actions — New Visit, Add Patient
 *   3. Recent visits list with AI + WhatsApp status badges
 *   4. Patient search modal
 *
 * Data:
 *   GET /api/v1/doctors/me/stats   — stats counts (useDoctorStats hook)
 *   GET /api/v1/visits?limit=10    — recent visits (useVisits hook)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, ChevronRight } from 'lucide-react'

import DoctorLayout              from '@/components/layout/DoctorLayout'
import PageHeader                from '@/components/common/PageHeader'
import StatsGrid                 from '@/components/doctor/StatsGrid'
import VisitRow                  from '@/components/doctor/VisitRow'
import PatientSearch             from '@/components/doctor/PatientSearch'
import { Button }                from '@/components/ui/Button'
import { SkeletonCard }          from '@/components/ui/Spinner'
import EmptyState                from '@/components/ui/EmptyState'
import Modal, { ConfirmModal }   from '@/components/ui/Modal'
import { PatientQuickAddForm }   from '@/components/forms/PatientQuickAddForm'

import { useDoctorStats }  from '@/hooks/useDoctorStats'
import { useVisits }       from '@/hooks/useVisits'
import { useAuthStore }    from '@/store'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function QuickActionCard({ icon, title, desc, colorClass, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full p-5 bg-white rounded-2xl border border-gray-100 shadow-sm
        transition-all hover:shadow-md hover:-translate-y-0.5 ${colorClass}`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-bold text-gray-900 mb-1 text-sm">{title}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user }  = useAuthStore()

  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showSearch, setShowSearch]         = useState(false)

  const { stats, isLoading: statsLoading, refetch: refetchStats } = useDoctorStats()
  const {
    visits,
    isLoading: visitsLoading,
    isError,
    refetch: refetchVisits,
  } = useVisits({ limit: 10, sort: 'createdAt,desc' })

  const firstName = user?.name?.split(' ')[0] ?? 'Doctor'

  const handleRefresh = () => { refetchStats(); refetchVisits() }

  return (
    <DoctorLayout>
      <PageHeader
        title={`Good ${getGreeting()}, Dr. ${firstName} 👋`}
        subtitle="Here's what's happening with your patients today."
        action={
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleRefresh} aria-label="Refresh">
              <RefreshCw size={15} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowSearch(true)}>
              <Search size={15} className="mr-1.5" /> Find patient
            </Button>
            <Button size="sm" onClick={() => navigate('/doctor/visits/new')}>
              <Plus size={15} className="mr-1.5" /> New Visit
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-5xl">

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <StatsGrid stats={stats} isLoading={statsLoading} />

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            icon="🩺"
            title="New Visit"
            desc="Record a consultation and generate an AI patient summary."
            colorClass="hover:border-emerald-300 hover:bg-emerald-50/60"
            onClick={() => navigate('/doctor/visits/new')}
          />
          <QuickActionCard
            icon="👤"
            title="Add Patient"
            desc="Register a new patient with their name, phone, and language."
            colorClass="hover:border-blue-300 hover:bg-blue-50/60"
            onClick={() => setShowAddPatient(true)}
          />
          <QuickActionCard
            icon="👥"
            title="All Patients"
            desc="Browse your full patient list, search by name or phone."
            colorClass="hover:border-purple-300 hover:bg-purple-50/60"
            onClick={() => navigate('/doctor/patients')}
          />
        </div>

        {/* ── Recent visits ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">Recent Visits</h2>
            <button
              onClick={() => navigate('/doctor/patients')}
              className="flex items-center gap-1 text-sm text-emerald-600 font-semibold hover:underline"
            >
              All patients <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {visitsLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} className="h-[60px]" />
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                icon="⚠️"
                title="Could not load visits"
                description="Check your connection and try again."
                action={<Button size="sm" onClick={refetchVisits}>Retry</Button>}
              />
            ) : visits?.length === 0 ? (
              <EmptyState
                icon="🩺"
                title="No visits yet"
                description="Create your first patient visit to get started with Shifa."
                action={
                  <Button size="sm" onClick={() => navigate('/doctor/visits/new')}>
                    <Plus size={14} className="mr-1" /> New Visit
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {visits?.map((visit) => (
                  <VisitRow
                    key={visit.id}
                    visit={visit}
                    onClick={() => navigate(`/doctor/visits/${visit.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <Modal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        title="Add New Patient"
      >
        <PatientQuickAddForm
          onSuccess={() => { setShowAddPatient(false); refetchStats() }}
          onCancel={() => setShowAddPatient(false)}
        />
      </Modal>

      <Modal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        title="Search Patients"
        size="lg"
      >
        <PatientSearch
          onSelect={(patient) => {
            setShowSearch(false)
            navigate(`/doctor/patients/${patient.id}`)
          }}
        />
      </Modal>
    </DoctorLayout>
  )
}
