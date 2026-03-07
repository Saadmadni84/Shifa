import { useParams, Link } from 'react-router-dom';
import { demoPatients } from '@/data/demo/demoData';
import { ArrowLeft, Pill, Activity, MessageCircle, User, Globe, HeartPulse } from 'lucide-react';
import { useState } from 'react';

export default function DemoVisitSummaryPage() {
  const { id, vid } = useParams();
  const patient = demoPatients.find(p => p.id === id);
  const visit = patient?.visits.find(v => v.id === vid);
  const [chatOpen, setChatOpen] = useState(false);
  const [summaryLang, setSummaryLang] = useState('hi');

  if (!visit) return <div className="p-8">Visit not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
           <Link to={`/demo/patient/${id}`} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
             <ArrowLeft size={20} />
           </Link>
           <div>
             <h1 className="font-bold text-gray-900 leading-tight">Visit Summary</h1>
             <p className="text-xs text-gray-500">{visit.date}</p>
           </div>
         </div>
      </div>
      
      {/* Content */}
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Patient Snapshot */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{patient.name}</h2>
              <p className="text-xs text-gray-500">Patient ID: {patient.id.toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-gray-500 flex items-center gap-1 mb-1"><User size={12} /> Age</div>
              <div className="font-semibold text-gray-900">{patient.age} yrs</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-gray-500 flex items-center gap-1 mb-1"><Globe size={12} /> Language</div>
              <div className="font-semibold text-gray-900">{patient.language}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-gray-500 flex items-center gap-1 mb-1"><HeartPulse size={12} /> Condition</div>
              <div className="font-semibold text-gray-900 line-clamp-2">{patient.condition}</div>
            </div>
          </div>
        </div>

        {/* Scenario Meta */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Clinical Scenario</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100"><span className="text-gray-500">Scenario ID:</span> <span className="font-semibold text-gray-900">{visit.scenarioId || visit.id}</span></div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100"><span className="text-gray-500">Domain:</span> <span className="font-semibold text-gray-900">{visit.domain || 'General'}</span></div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100"><span className="text-gray-500">Status:</span> <span className="font-semibold text-gray-900">{visit.visitStatus || 'N/A'}</span></div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100"><span className="text-gray-500">WhatsApp:</span> <span className="font-semibold text-gray-900">{visit.whatsappStatus || visit.aiStatus}</span></div>
          </div>
          {visit.followUpDate && (
            <p className="mt-3 text-xs text-gray-600"><span className="font-semibold">Follow-up:</span> {visit.followUpDate}</p>
          )}
        </div>

        {/* Intro */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-800 text-sm leading-relaxed">
            Hi <b>{patient.name}</b>, here is the summary of your visit today. Your doctor has diagnosed you with <b>{visit.diagnosis}</b>.
          </p>
          {visit.chiefComplaint && <p className="mt-2 text-xs text-gray-600"><span className="font-semibold">Chief complaint:</span> {visit.chiefComplaint}</p>}
        </div>
        
        {/* AI Summary EN/HI */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">AI Summary</h2>
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
            {visit.aiSummary?.[summaryLang] || 'Summary not available.'}
          </pre>
        </div>

        {/* Advice */}
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500 p-1.5 rounded-lg"><Pill size={16} className="text-white"/></div>
            <h2 className="font-bold text-gray-900">Doctor's Advice</h2>
          </div>
          <p className="text-sm text-gray-700">{visit.advice}</p>
        </div>

        {/* Prescription */}
        {Array.isArray(visit.prescription) && visit.prescription.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Prescription</h2>
            <div className="space-y-2">
              {visit.prescription.map((med, idx) => (
                <div key={`${med.medicine}-${idx}`} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm">{med.medicine}</p>
                  <p className="text-xs text-gray-600 mt-1">{med.dose} • {med.frequency} • {med.timing} • {med.duration}</p>
                  <p className="text-xs text-gray-600 mt-1">{med.purpose}</p>
                  {med.critical && <p className="text-[11px] text-red-600 mt-1 font-semibold">Critical: do not stop without doctor advice</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Vitals */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-500 p-1.5 rounded-lg"><Activity size={16} className="text-white"/></div>
            <h2 className="font-bold text-gray-900">Recorded Vitals</h2>
          </div>
          {Array.isArray(visit.vitalsDetailed) && visit.vitalsDetailed.length > 0 ? (
            <div className="space-y-2">
              {visit.vitalsDetailed.map((v, idx) => (
                <div key={`${v.name}-${idx}`} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">{v.name}</p>
                    <p className="font-semibold text-gray-900 text-sm">{v.reading}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-md px-2 py-1">{v.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Blood Pressure</p>
                <p className="font-semibold text-gray-900">{patient.lastVitals.bp}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Blood Sugar</p>
                <p className="font-semibold text-gray-900">{patient.lastVitals.sugar}</p>
              </div>
            </div>
          )}
        </div>

        {/* Raw Doctor Notes */}
        {visit.rawDoctorNotes && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Raw Doctor Notes</h2>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 font-mono">
              {visit.rawDoctorNotes}
            </pre>
          </div>
        )}

        {/* WhatsApp Message */}
        {visit.whatsappMessage && (
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
            <h2 className="font-bold text-gray-900 mb-2">WhatsApp Message (Sent)</h2>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700 bg-white border border-emerald-100 rounded-xl p-3 font-sans">
              {visit.whatsappMessage}
            </pre>
          </div>
        )}

        {/* Profile Detail */}
        {patient.profile && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Patient Profile</h2>
            <div className="space-y-1.5 text-xs text-gray-700">
              <p><span className="font-semibold">UUID:</span> {patient.profile.patientUuid}</p>
              <p><span className="font-semibold">DOB:</span> {patient.profile.dob}</p>
              <p><span className="font-semibold">Gender:</span> {patient.profile.gender}</p>
              <p><span className="font-semibold">Blood Group:</span> {patient.profile.bloodGroup}</p>
              <p><span className="font-semibold">ABHA ID:</span> {patient.profile.abhaId}</p>
              <p><span className="font-semibold">Phone:</span> {patient.profile.phone}</p>
              <p><span className="font-semibold">Email:</span> {patient.profile.email}</p>
              <p><span className="font-semibold">Location:</span> {patient.profile.city} - {patient.profile.pincode}</p>
              <p><span className="font-semibold">Emergency Contact:</span> {patient.profile.emergencyContact}</p>
              <p><span className="font-semibold">Allergy:</span> {patient.profile.allergies?.join(', ')}</p>
              <p><span className="font-semibold">Chronic Conditions:</span> {patient.profile.chronicConditions?.join(', ')}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Chat Button */}
      <button 
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-transform hover:scale-105 z-20"
      >
        <MessageCircle size={24} />
      </button>

      {/* Mock Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 sm:p-0">
          <div className="bg-white w-full sm:max-w-md h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="bg-emerald-500 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Shifa Assistant</h3>
                <p className="text-xs opacity-80">Ask me anything about your visit</p>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-xs font-bold">
                Close
              </button>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50">
               <div className="bg-white border text-sm border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm w-5/6 shadow-sm">
                 Hello {patient.name}! I am Shifa, your AI medical assistant. I've read your doctor's notes. Do you have any questions about taking {visit.advice.includes('Metformin') ? 'Metformin' : 'your medication'}?
               </div>
            </div>
            
            <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              <button className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                 <ArrowLeft style={{transform: "rotate(135deg)"}} size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}