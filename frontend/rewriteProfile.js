const fs = require('fs');

const content = import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Clock, FileText, Activity, Phone, Calendar, HeartPulse, Scale, Activity as ActivityIcon } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import DoctorLayout from '@/components/layout/DoctorLayout'
import Button from '@/components/ui/Button'
import { DEMO_DOCTOR, DEMO_PATIENTS, DEMO_VISITS } from '@/data/demo/doctorDemoData'

// Mock trend data
const trendData = [
  { date: 'Jan', sys: 135, dia: 85, hr: 76, weight: 75.2 },
  { date: 'Feb', sys: 132, dia: 83, hr: 74, weight: 74.8 },
  { date: 'Mar', sys: 128, dia: 80, hr: 75, weight: 74.5 },
  { date: 'Apr', sys: 125, dia: 78, hr: 72, weight: 74.0 },
  { date: 'May', sys: 122, dia: 79, hr: 70, weight: 73.8 },
  { date: 'Jun', sys: 120, dia: 80, hr: 72, weight: 73.5 }
]

export default function PatientProfilePage() {
  const navigate = useNavigate()
  const { doctorId, patientId } = useParams()
  
  const patient = DEMO_PATIENTS.find(p => p.id === patientId)
  const patientVisits = DEMO_VISITS[patientId] || []

  if (!patient) {
    return (
      <DoctorLayout doctor={DEMO_DOCTOR}>
        <div className=\"p-8 text-center text-gray-500\">Patient not found</div>
      </DoctorLayout>
    )
  }

  // Tweak trend data slightly per patient for variety
  const pTrendData = trendData.map((d, i) => ({
    ...d,
    sys: patientId === 'p2' ? d.sys - 10 : (patientId === 'p3' ? d.sys + 15 : d.sys),
    dia: patientId === 'p2' ? d.dia - 5 : (patientId === 'p3' ? d.dia + 10 : d.dia),
    hr: patientId === 'p3' ? d.hr + 10 : d.hr,
    weight: patientId === 'p1' ? d.weight + 5 : d.weight
  }))

  return (
    <DoctorLayout doctor={DEMO_DOCTOR}>
      <div className=\"p-4 sm:p-6 max-w-6xl space-y-6\">
        
        {/* Header Profile Card */}
        <div className=\"bg-white rounded-2xl border border-gray-100 shadow-sm p-6\">
          <div className=\"flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between\">
            <div className=\"flex items-center gap-5\">
              <div className=\"w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-3xl shrink-0\">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h1 className=\"text-2xl font-bold text-gray-900 mb-1\">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className=\"text-gray-500 flex items-center gap-2\">
                  {patient.age}y • {patient.gender} • <Phone size={14}/> {patient.phone}
                </p>
                <div className=\"mt-3 flex gap-2\">
                  <span className=\"px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg\">
                    {patient.primaryCondition}
                  </span>
                  <span className=\"px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg\">
                    {patient.language === 'en' ? 'English Speaker' : 'Hindi Speaker'}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate(\/demo/doctor/\/visit/new?patient=\\)} className=\"shrink-0\">
              <Plus size={16} className=\"mr-2\" /> Start Visit
            </Button>
          </div>
        </div>

        {/* Vitals Charts Section */}
        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
          {/* Blood Pressure Chart */}
          <div className=\"bg-white rounded-2xl border border-gray-100 shadow-sm p-5\">
            <h2 className=\"font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm\">
              <ActivityIcon size={16} className=\"text-rose-500\"/>
              Blood Pressure Trend
            </h2>
            <div className=\"h-40 w-full\">
              <ResponsiveContainer width=\"100%\" height=\"100%\">
                <LineChart data={pTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f3f4f6\" />
                  <XAxis dataKey=\"date\" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type=\"monotone\" dataKey=\"sys\" name=\"Systolic\" stroke=\"#f43f5e\" strokeWidth={2} dot={{r: 3, strokeWidth: 2}} activeDot={{r: 5}} />
                  <Line type=\"monotone\" dataKey=\"dia\" name=\"Diastolic\" stroke=\"#3b82f6\" strokeWidth={2} dot={{r: 3, strokeWidth: 2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className=\"mt-2 text-center text-xs text-gray-500 font-medium space-x-3\">
              <span className=\"inline-flex items-center gap-1\"><span className=\"w-2 h-2 rounded-full bg-rose-500\"></span> Systolic</span>
              <span className=\"inline-flex items-center gap-1\"><span className=\"w-2 h-2 rounded-full bg-blue-500\"></span> Diastolic</span>
            </div>
          </div>

          {/* Heart Rate Chart */}
          <div className=\"bg-white rounded-2xl border border-gray-100 shadow-sm p-5\">
            <h2 className=\"font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm\">
              <HeartPulse size={16} className=\"text-orange-500\"/>
              Heart Rate Trend
            </h2>
            <div className=\"h-40 w-full\">
              <ResponsiveContainer width=\"100%\" height=\"100%\">
                <AreaChart data={pTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id=\"colorHr\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                      <stop offset=\"5%\" stopColor=\"#f97316\" stopOpacity={0.2}/>
                      <stop offset=\"95%\" stopColor=\"#f97316\" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f3f4f6\" />
                  <XAxis dataKey=\"date\" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type=\"monotone\" dataKey=\"hr\" name=\"HR (bpm)\" stroke=\"#f97316\" strokeWidth={2} fill=\"url(#colorHr)\" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weight Chart */}
          <div className=\"bg-white rounded-2xl border border-gray-100 shadow-sm p-5\">
            <h2 className=\"font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm\">
              <Scale size={16} className=\"text-emerald-500\"/>
              Weight Trend
            </h2>
            <div className=\"h-40 w-full\">
              <ResponsiveContainer width=\"100%\" height=\"100%\">
                <AreaChart data={pTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id=\"colorWeight\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                      <stop offset=\"5%\" stopColor=\"#10b981\" stopOpacity={0.2}/>
                      <stop offset=\"95%\" stopColor=\"#10b981\" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f3f4f6\" />
                  <XAxis dataKey=\"date\" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type=\"monotone\" dataKey=\"weight\" name=\"Weight (kg)\" stroke=\"#10b981\" strokeWidth={2} fill=\"url(#colorWeight)\" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
          <div className=\"md:col-span-1\">
            <div className=\"bg-white rounded-2xl border border-gray-100 shadow-sm p-5\">
              <h2 className=\"font-bold text-gray-900 mb-4 flex items-center gap-2\">
                <FileText size={18} className=\"text-blue-500\"/>
                Medical Background
              </h2>
              <div className=\"space-y-4\">
                <div>
                  <h3 className=\"text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2\">Known Conditions</h3>
                  <ul className=\"space-y-2 text-sm text-gray-700\">
                    {patient.medicalHistory?.conditions?.map((c, i) => (
                      <li key={i} className=\"flex items-start gap-2\">
                        <div className=\"w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5\" />
                        {c}
                      </li>
                    )) || <li>No conditions recorded</li>}
                  </ul>
                </div>
                {patient.medicalHistory?.allergies?.length > 0 && (
                  <div>
                    <h3 className=\"text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2\">Allergies</h3>
                    <div className=\"flex flex-wrap gap-2\">
                      {patient.medicalHistory.allergies.map((a, i) => (
                        <span key={i} className=\"px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium\">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visits Timeline */}
          <div className=\"md:col-span-2\">
            <div className=\"bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full\">
              <div className=\"flex items-center justify-between mb-6\">
                <h2 className=\"font-bold text-gray-900 flex items-center gap-2\">
                  <Clock size={18} className=\"text-purple-500\"/>
                  Recent Visits
                </h2>
              </div>
              
              <div className=\"space-y-4\">
                {patientVisits.length > 0 ? patientVisits.map((visit, index) => (
                  <div key={index} className=\"flex gap-4 p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer\" onClick={() => navigate(\/demo/doctor/\/patient/\/visit/\\)}>
                    <div className=\"w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex flex-col items-center justify-center shrink-0\">
                      <span className=\"text-xs font-bold leading-none mb-0.5\">{new Date(visit.date).getDate()}</span>
                      <span className=\"text-[10px] uppercase leading-none\">{new Date(visit.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className=\"flex-1 min-w-0\">
                      <h3 className=\"font-bold text-gray-900 text-sm mb-1\">{visit.diagnosis || 'General Consultation'}</h3>
                      <p className=\"text-xs text-gray-500 line-clamp-2 mb-2\">{visit.notes}</p>
                      {visit.medications?.length > 0 && (
                        <div className=\"flex flex-wrap gap-1\">
                          {visit.medications.map((m, i) => (
                            <span key={i} className=\"px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded\">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className=\"text-center py-10\">
                    <Calendar size={32} className=\"mx-auto text-gray-300 mb-3\" />
                    <p className=\"text-gray-500 font-medium\">No previous visits</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DoctorLayout>
  )
}
;

fs.writeFileSync('c:/Users/Admin/Desktop/New Project/Shifa/frontend/src/pages/doctor/PatientProfilePage.jsx', content);
console.log('Profile page replaced successfully!');
