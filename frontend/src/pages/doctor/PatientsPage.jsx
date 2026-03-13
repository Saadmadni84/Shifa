import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, Users, SlidersHorizontal, Settings } from 'lucide-react'

import DoctorLayout from '@/components/layout/DoctorLayout'
import PageHeader from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'
import { DEMO_DOCTOR, DEMO_PATIENTS, DEMO_VISITS } from '@/data/demo/doctorDemoData'

export default function PatientsPage() {
  const navigate = useNavigate()
  const { doctorId } = useParams()
  const [searchTerm, setSearchTerm] = useState('')

  const patients = DEMO_PATIENTS.filter(p => 
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DoctorLayout doctor={DEMO_DOCTOR}>
      <PageHeader
        title="Patients"
        subtitle={`Managing ${DEMO_PATIENTS.length} total patients`}
        action={
          <Button onClick={() => navigate(`/demo/doctor/${doctorId}/visit/new`)}>
            <Plus size={16} className="mr-2" />
            Add Patient
          </Button>
        }
      />

      <div className="p-4 sm:p-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>
        </div>

        {patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map(p => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/demo/doctor/${doctorId}/patient/${p.id}`)}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-emerald-200 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                    {p.language === 'en' ? 'English' : 'Hindi'}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">
                  {p.firstName} {p.lastName}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{p.age} years old • {p.gender}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Condition:</span>
                    <span className="font-medium text-gray-900">{p.primaryCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target BP:</span>
                    <span className="font-medium text-gray-900">{p.medicalHistory?.targetBP || '120/80'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={(e) => { e.stopPropagation(); navigate(`/demo/doctor/${doctorId}/visit/new?patient=${p.id}`)}}>
                    New Visit
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={(e) => { e.stopPropagation(); navigate(`/demo/doctor/${doctorId}/patient/${p.id}`)}}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-medium text-gray-900">No patients found</p>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
