const fs = require('fs');

const content = import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Clock, FileText, Activity, Phone, Calendar, HeartPulse, Scale, Activity as ActivityIcon, MessageCircle, AlertTriangle, Heart, CheckCircle, XCircle } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import DoctorLayout from '@/components/layout/DoctorLayout'
import Button from '@/components/ui/Button'
import { DEMO_DOCTOR, DEMO_PATIENTS, DEMO_VISITS } from '@/data/demo/doctorDemoData'
import { demoPatients as demoSourcePatients } from '@/data/demo/demoData'

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
  const fullPatientData = demoSourcePatients.find(p => p.id === patientId)
  const latestVisitData = fullPatientData?.visits?.[0]

  if (!patient || !latestVisitData) {
    return (
      <DoctorLayout doctor={DEMO_DOCTOR}>
        <div className="p-8 text-center text-gray-500">Patient Data Not Found</div>
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

  const summaryData = latestVisitData.summaries['en']

  return (
    <DoctorLayout doctor={DEMO_DOCTOR}>
      <div className="p-4 sm:p-6 max-w-6xl space-y-6">
        
        {/* Header Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-3xl shrink-0">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {fullPatientData.name}
                </h1>
                <p className="text-gray-500 flex items-center gap-2">
                  {fullPatientData.age}y • {fullPatientData.profile?.gender || 'Unknown'} • <Phone size={14}/> {fullPatientData.profile?.phone || patient.phone}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                    {fullPatientData.condition}
                  </span>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                    {fullPatientData.language} Speaker
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate(\/demo/doctor/\/visit/new?patient=\\)} className="shrink-0">
              <Plus size={16} className="mr-2" /> Start New Visit
            </Button>
          </div>
        </div>

        {/* Vitals Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Blood Pressure Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <ActivityIcon size={16} className="text-rose-500"/>
              Blood Pressure Trend
            </h2>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="sys" name="Systolic" stroke="#f43f5e" strokeWidth={2} dot={{r: 3, strokeWidth: 2}} activeDot={{r: 5}} />
                  <Line type="monotone" dataKey="dia" name="Diastolic" stroke="#3b82f6" strokeWidth={2} dot={{r: 3, strokeWidth: 2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500 font-medium space-x-3">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Systolic</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Diastolic</span>
            </div>
          </div>

          {/* Heart Rate Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <HeartPulse size={16} className="text-orange-500"/>
              Heart Rate Trend
            </h2>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="hr" name="HR (bpm)" stroke="#f97316" strokeWidth={2} fill="url(#colorHr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <Scale size={16} className="text-emerald-500"/>
              Weight Trend
            </h2>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#10b981" strokeWidth={2} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Comprehensive Patient AI Summary view */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-indigo-500" />
            Detailed Latest Visit Breakdown
            <span className="ml-3 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              Recorded: {latestVisitData.date}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column (Diagnosis & Medications) */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={20} className="text-rose-500" />
                  <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest">Diagnosis Focus</h3>
                </div>
                <p className="text-xl font-bold text-gray-900 leading-tight">
                  {latestVisitData.diagnosis}
                </p>
                <div className="mt-4 p-4 bg-teal-50/50 rounded-xl text-gray-700 border border-teal-100 leading-relaxed text-sm">
                  {summaryData.patientFriendlyExplanation}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">??</span>
                  Medication Plan
                </h3>
                <div className="space-y-3">
                  {latestVisitData.prescriptions.map((med, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{med.name} {med.dose}</p>
                          <p className="text-xs text-gray-500">Duration: {med.duration}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full">{med.timing}</span>
                      </div>
                      <div className="flex bg-white rounded-lg border border-gray-100 p-1.5 justify-around mt-3">
                        <div className={\lex flex-col items-center flex-1 \\}>
                          <span className="text-sm">??</span>
                          <span className="text-[10px] font-bold mt-0.5">Morning</span>
                        </div>
                        <div className="w-px bg-gray-100"></div>
                        <div className={\lex flex-col items-center flex-1 \\}>
                          <span className="text-sm">??</span>
                          <span className="text-[10px] font-bold mt-0.5">Noon</span>
                        </div>
                        <div className="w-px bg-gray-100"></div>
                        <div className={\lex flex-col items-center flex-1 \\}>
                          <span className="text-sm">??</span>
                          <span className="text-[10px] font-bold mt-0.5">Night</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (Alerts, Diet, Followup) */}
            <div className="space-y-6">
              
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-red-500/10">
                  <AlertTriangle size={100} />
                </div>
                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2 relative z-10">
                  <AlertTriangle size={18} /> Emergency Flags
                </h3>
                <p className="text-sm text-red-800 mb-3 relative z-10">Return to clinic immediately if patient experiences:</p>
                <ul className="space-y-2 relative z-10">
                  {summaryData.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-red-700 bg-white/50 p-2.5 rounded-lg border border-red-100">
                      <span className="text-red-500 font-bold shrink-0">!</span> {flag}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart size={18} className="text-emerald-500" /> Lifestyle & Diet
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 mb-3 bg-emerald-50 py-1.5 px-3 rounded-lg"><CheckCircle size={14}/> Do's</h4>
                    <ul className="space-y-2.5">
                      {summaryData.dos.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-700 mb-3 bg-rose-50 py-1.5 px-3 rounded-lg"><XCircle size={14}/> Don'ts</h4>
                    <ul className="space-y-2.5">
                      {summaryData.donts.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <span className="text-rose-500 mt-0.5">×</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" /> Next Follow-up
                  </h3>
                  <p className="text-sm text-gray-500">{summaryData.followUp}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Clock size={20} className="text-blue-600" />
                </div>
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
console.log('Successfully wrote the highly detailed Patient Profile Page mapping the exact portal experience into the Doctor Dashboard!');
