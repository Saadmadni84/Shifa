import { useParams, Link } from 'react-router-dom';
import { demoPatients } from '@/data/demo/demoData';
import { Calendar, FileText, ArrowLeft, Heart } from 'lucide-react';

export default function DemoPatientView() {
  const { id } = useParams();
  const patient = demoPatients.find(p => p.id === id);

  if (!patient) return <div className="p-8 text-center">Patient not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-emerald-500 p-6 text-white text-center relative">
          <Link to="/demo/scenarios" className="absolute left-4 top-4 bg-white/20 p-2 rounded-full hover:bg-white/30">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-emerald-500 font-bold text-2xl">
            {patient.name.charAt(0)}
          </div>
          <h1 className="text-xl font-bold">{patient.name}</h1>
          <p className="text-emerald-50 opacity-90 text-sm">{patient.age} years • {patient.language}</p>
        </div>
        
        <div className="p-5">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
              <Heart size={18} className="text-red-500 mb-1" />
              <span className="text-xs text-gray-500">Language</span>
              <span className="font-semibold text-gray-900">{patient.language}</span>
            </div>
            <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
              <Activity size={18} className="text-blue-500 mb-1" />
              <span className="text-xs text-gray-500">Last BP</span>
              <span className="font-semibold text-gray-900">{patient.lastVitals.bp}</span>
            </div>
          </div>
          
          <h2 className="font-bold text-gray-900 mb-3 ml-1">Recent Visits</h2>
          <div className="space-y-3">
            {patient.visits.map(visit => (
              <Link key={visit.id} to={`/demo/patient/${patient.id}/visit/${visit.id}`} className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="font-medium text-sm text-gray-900">{visit.date}</span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{visit.aiStatus}</span>
                </div>
                <div className="flex gap-2 items-center text-sm text-gray-600 mt-2">
                  <FileText size={15} className="text-blue-500" />
                  <span className="font-medium">{visit.diagnosis}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Activity({ className, ...props }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
}