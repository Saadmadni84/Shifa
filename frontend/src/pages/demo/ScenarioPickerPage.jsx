import { Link } from 'react-router-dom';
import { demoPatients } from '@/data/demo/demoData';
import { User, Activity, AlertCircle } from 'lucide-react';

export default function ScenarioPickerPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Patient Scenario</h1>
        
        <div className="grid gap-4">
          {demoPatients.map(patient => (
            <Link key={patient.id} to={`/demo/patient/${patient.id}`} className="block border border-gray-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <User size={24} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{patient.name} <span className="text-sm font-normal text-gray-500">({patient.age}y)</span></h3>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><AlertCircle size={14}/> {patient.condition}</span>
                    <span className="flex items-center gap-1"><Activity size={14}/> BP: {patient.lastVitals.bp}</span>
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