import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Clock, FileText, Activity, Phone, Calendar, HeartPulse, Scale, Activity as ActivityIcon, MessageCircle, AlertTriangle, Heart, CheckCircle, XCircle } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import DoctorLayout from '@/components/layout/DoctorLayout'
import Button from '@/components/ui/Button'
import { DEMO_DOCTOR, DEMO_PATIENTS, DEMO_VISITS } from '@/data/demo/doctorDemoData'
import { demoPatients as demoSourcePatients } from '@/data/demo/demoData'

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
  
  const [summaryLang, setSummaryLang] = useState('en')

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

  const pTrendData = trendData.map((d, i) => ({
    ...d,
    sys: patientId === 'p2' ? d.sys - 10 : (patientId === 'p3' ? d.sys + 15 : d.sys),
    dia: patientId === 'p2' ? d.dia - 5 : (patientId === 'p3' ? d.dia + 10 : d.dia),
    hr: patientId === 'p3' ? d.hr + 10 : d.hr,
    weight: patientId === 'p1' ? d.weight + 5 : d.weight
  }))

  return (
    <DoctorLayout doctor={DEMO_DOCTOR}>
      <div className="p-4 sm:p-6 max-w-6xl space-y-6">
        
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
                  {fullPatientData.age}y � {fullPatientData.profile?.gender || 'Unknown'} � <Phone size={14}/> {fullPatientData.profile?.phone || patient.phone}
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

            <Button onClick={() => navigate(`/demo/doctor/${doctorId}/visit/new?patient=${patient.id}`)} className="shrink-0">
              <Plus size={16} className="mr-2" /> Start New Visit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <ActivityIcon size={16} className="text-rose-500"/> Blood Pressure Trend
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
             <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <HeartPulse size={16} className="text-orange-500"/> Heart Rate Trend
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
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="hr" name="HR (bpm)" stroke="#f97316" strokeWidth={2} fill="url(#colorHr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <Scale size={16} className="text-emerald-500"/> Weight Trend
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

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-indigo-500" />
            Detailed Latest Visit Breakdown
            <span className="ml-3 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              Recorded: {latestVisitData.date}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={20} className="text-rose-500" />
                  <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest">Diagnosis Focus</h3>
                </div>
                <p className="text-xl font-bold text-gray-900 leading-tight mb-2">
                  {latestVisitData.diagnosis}
                </p>
                {latestVisitData.chiefComplaint && <p className="mt-2 text-sm text-gray-600 mb-2"><span className="font-semibold">Chief complaint:</span> {latestVisitData.chiefComplaint}</p>}
                <div className="p-4 bg-teal-50/50 rounded-xl text-gray-700 border border-teal-100 leading-relaxed text-sm">
                  {latestVisitData.advice || 'No specific advice recorded.'}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">??</span>
                  Medication Plan
                </h3>
                <div className="space-y-3">
                  {latestVisitData.prescription?.map((med, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{med.medicine} {med.dose || med.frequency}</p>
                          <p className="text-xs text-gray-500">Duration: {med.duration}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full">{med.timing}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 bg-white p-2 rounded border border-gray-100">
                        <span className="font-semibold text-gray-700">Purpose:</span> {med.purpose}
                      </div>
                    </div>
                  ))}
                  {(!latestVisitData.prescription || latestVisitData.prescription.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No prescriptions recorded.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                     <FileText size={18} className="text-indigo-600" /> AI Patient Summary 
                  </h3>
                  <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                    <button
                      onClick={() => setSummaryLang('en')}
                      className={`px-3 py-1.5 ${summaryLang === 'en' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700'}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setSummaryLang('hi')}
                      className={`px-3 py-1.5 ${summaryLang === 'hi' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700'}`}
                    >
                      HI
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 font-sans">
                  {latestVisitData.aiSummary?.[summaryLang] || 'Summary not available.'}
                </pre>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ActivityIcon size={18} className="text-orange-500"/> Vitals Recorded
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {latestVisitData.vitalsDetailed?.map((vital, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center">
                      <span className="text-xs text-gray-500 mb-1">{vital.name}</span>
                      <div className="flex items-center justify-between">
                         <span className="font-bold text-gray-900">{vital.reading}</span>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${vital.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{vital.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {latestVisitData.followUpDate && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <Calendar size={18} className="text-blue-500" /> Next Follow-up
                    </h3>
                    <p className="text-sm text-gray-500">{latestVisitData.followUpDate}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}

