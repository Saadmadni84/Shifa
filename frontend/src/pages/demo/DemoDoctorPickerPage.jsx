import { Link } from 'react-router-dom';
import { demoDoctors } from '@/data/demo/demoData';
import { Stethoscope, Users, Zap } from 'lucide-react';

export default function DemoDoctorPickerPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Doctor Persona</h1>
        
        <div className="grid gap-4">
          {demoDoctors.map(doc => (
            <Link key={doc.id} to={`/demo/doctor/${doc.id}`} className="block border border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-500">
                  <Stethoscope size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{doc.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{doc.specialty}</p>
                  <div className="flex gap-3 text-xs font-medium">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md flex items-center gap-1"><Users size={12}/> {doc.patientsToday} Patients today</span>
                    {doc.pendingAI > 0 && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md flex items-center gap-1"><Zap size={12}/> {doc.pendingAI} AI Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/demo" className="text-sm text-gray-500 hover:text-gray-900 font-medium">← Back to Demo Home</Link>
        </div>
      </div>
    </div>
  );
}