import React from 'react'
import DoctorLayout from '@/components/layout/DoctorLayout'
import { DEMO_DOCTOR } from '@/data/demo/doctorDemoData'

export default function ProfilePage() {
  return (
    <DoctorLayout doctor={DEMO_DOCTOR}>
      <div className="p-6 max-w-2xl mx-auto mt-10 text-center bg-white rounded-2xl border border-gray-200">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4">
          {DEMO_DOCTOR.name.split(' ').map(n=>n[0]).join('')}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{DEMO_DOCTOR.name}</h2>
        <p className="text-gray-500 mt-2">Clinic Settings • Manage Profile</p>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-400">
          This is a static demo environment focusing on the Shifa AI flow. Detailed clinic settings are restricted in the preview.
        </div>
      </div>
    </DoctorLayout>
  )
}
