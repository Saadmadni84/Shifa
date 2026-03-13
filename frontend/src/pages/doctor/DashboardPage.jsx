import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, ChevronRight } from 'lucide-react'

import DoctorLayout              from '@/components/layout/DoctorLayout'
import PageHeader                from '@/components/common/PageHeader'
import StatsGrid                 from '@/components/doctor/StatsGrid'
import VisitRow                  from '@/components/doctor/VisitRow'
import Button                    from '@/components/ui/Button'
import { DEMO_DOCTOR, DEMO_PATIENTS, DEMO_VISITS } from '@/data/demo/doctorDemoData'

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
      className={`text-left w-full p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${colorClass}`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-bold text-gray-900 mb-1 text-sm">{title}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  
  // Use Demo Data
  const doctor = DEMO_DOCTOR;
  const patients = DEMO_PATIENTS;
  const firstName = doctor.name.split(' ')[1] ?? 'Doctor'

  const mockStats = {
    todayVisits: 8,
    pendingAI: 3,
    sentToPatients: 5,
    unreadMessages: 12,
    totalPatients: patients.length,
    thisWeekVisits: 34,
  }

  return (
    <DoctorLayout doctor={doctor}>
      <PageHeader
        title={`Good ${getGreeting()}, Dr. ${firstName} 👋`}
        subtitle="Here's what's happening with your patients today."
        action={
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => {}} aria-label="Refresh">
              <RefreshCw size={15} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => {}}>
              <Search size={15} className="mr-1.5" /> Find patient
            </Button>
            <Button size="sm" onClick={() => navigate(`/demo/doctor/${doctor.id}/visit/new`)}>
              <Plus size={15} className="mr-1.5" /> New Visit
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
        <StatsGrid stats={mockStats} isLoading={false} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            icon="🩺"
            title="New Visit"
            desc="Record a consultation and generate an AI patient summary."
            colorClass="hover:border-emerald-300 hover:bg-emerald-50/60"
            onClick={() => navigate(`/demo/doctor/${doctor.id}/visit/new`)}
          />
          <QuickActionCard
            icon="👤"
            title="Add Patient"
            desc="Register a new patient with their name, phone, and language."
            colorClass="hover:border-blue-300 hover:bg-blue-50/60"
            onClick={() => {}}
          />
          <QuickActionCard
            icon="👥"
            title="All Patients"
            desc="Browse your full patient list, search by name or phone."
            colorClass="hover:border-purple-300 hover:bg-purple-50/60"
            onClick={() => navigate(`/demo/doctor/${doctor.id}/patients`)}
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">Your Patients</h2>
            <button
              onClick={() => navigate(`/demo/doctor/${doctor.id}/patients`)}
              className="flex items-center gap-1 text-sm text-emerald-600 font-semibold hover:underline"
            >
              All patients <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Patient</th>
                  <th className="p-4 font-semibold text-gray-600">Condition</th>
                  <th className="p-4 font-semibold text-gray-600 hidden sm:table-cell">Last BP</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/demo/doctor/${doctor.id}/patient/${p.id}`)}>
                    <td className="p-4">
                        <div className="font-bold text-gray-900">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-gray-500">{p.age} y/o • {p.gender}</div>
                    </td>
                    <td className="p-4 text-gray-700">{p.primaryCondition}</td>
                    <td className="p-4 text-gray-700 hidden sm:table-cell">{p.lastVitals?.bp || '-'}</td>
                    <td className="p-4 text-right">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/demo/doctor/${doctor.id}/patient/${p.id}`); }} className="text-emerald-600 font-semibold text-sm hover:underline">
                            View Profile
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DoctorLayout>
  )
}
