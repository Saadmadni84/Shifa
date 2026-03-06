import { useParams, Link } from 'react-router-dom';
import { demoDoctors, demoPatients } from '@/data/demo/demoData';
import { ArrowLeft, Activity, Calendar, FileText, Globe } from 'lucide-react';

export default function DemoDoctorPatientDetail() {
  const { id, pid } = useParams();
  const doc = demoDoctors.find(d => d.id === id);
  const patient = demoPatients.find(p => p.id === pid);

  if (!doc || !patient) return <div className="p-8 text-center">Data not found</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="w-64 bg-white border-r hidden md:block py-6 px-4">
        <h1 className="font-bold text-xl mb-8 flex items-center gap-2">
           <span className="bg-emerald-500 w-8 h-8 rounded-lg"></span> Shifa
        </h1>
        <div className="space-y-2 text-sm font-medium text-gray-500">
           <Link to={`/demo/doctor/${id}`} className="block p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">Dashboard</Link>
           <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">Patients</div>
           <div className="p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">Visits</div>
        </div>
      </div>
      
      <div className="flex-1 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/demo/doctor/${id}`} className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold">Patient Profile</h2>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                 {patient.name.charAt(0)}
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                 <p className="text-gray-500 text-sm flex items-center gap-1">
                    {patient.age} years old <span className="mx-1">•</span> <Globe size={14}/> {patient.language}
                 </p>
              </div>
           </div>
           <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700">
             Start Visit
           </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Activity size={18} className="text-red-500"/> Latest Vitals
                 </h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-gray-100">
                       <span className="text-gray-500">Blood Pressure</span>
                       <span className="font-bold text-gray-900">{patient.lastVitals.bp}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100">
                       <span className="text-gray-500">Blood Sugar</span>
                       <span className="font-bold text-gray-900">{patient.lastVitals.sugar}</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="md:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Visit History</h3>
                 <div className="space-y-4">
                    {patient.visits.map(v => (
                       <div key={v.id} className="border border-gray-100 p-4 rounded-xl hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400"/>
                                <span className="font-semibold text-gray-900">{v.date}</span>
                             </div>
                             <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">{v.aiStatus}</span>
                          </div>
                          <div className="text-gray-800 text-sm mt-2 flex items-start gap-2">
                             <FileText size={16} className="text-blue-500 mt-0.5 shrink-0"/>
                             <div>
                               <p className="font-semibold">{v.diagnosis}</p>
                               <p className="text-gray-500 mt-1">{v.advice}</p>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}