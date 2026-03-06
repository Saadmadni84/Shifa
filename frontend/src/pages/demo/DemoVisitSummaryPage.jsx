import { useParams, Link } from 'react-router-dom';
import { demoPatients } from '@/data/demo/demoData';
import { FileText, ArrowLeft, Pill, Activity, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function DemoVisitSummaryPage() {
  const { id, vid } = useParams();
  const patient = demoPatients.find(p => p.id === id);
  const visit = patient?.visits.find(v => v.id === vid);
  const [chatOpen, setChatOpen] = useState(false);

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
        {/* Intro */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-800 text-sm leading-relaxed">
            Hi <b>{patient.name}</b>, here is the summary of your visit today. Your doctor has diagnosed you with <b>{visit.diagnosis}</b>.
          </p>
        </div>
        
        {/* Advice */}
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500 p-1.5 rounded-lg"><Pill size={16} className="text-white"/></div>
            <h2 className="font-bold text-gray-900">Doctor's Advice</h2>
          </div>
          <p className="text-sm text-gray-700">{visit.advice}</p>
        </div>
        
        {/* Vitals */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-500 p-1.5 rounded-lg"><Activity size={16} className="text-white"/></div>
            <h2 className="font-bold text-gray-900">Recorded Vitals</h2>
          </div>
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
        </div>
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