import { useParams, Link } from 'react-router-dom';
import { demoDoctors, demoPatients } from '@/data/demo/demoData';
import { Users, Zap, Plus, ArrowLeft } from 'lucide-react';

export default function DemoDoctorDashboard() {
  const { id } = useParams();
  const doc = demoDoctors.find(d => d.id === id);

  if (!doc) return <div className="p-8">Doctor not found</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Mock */}
      <div className="w-64 bg-white border-r hidden md:block py-6 px-4">
        <h1 className="font-bold text-xl mb-8 flex items-center gap-2">
          <span className="bg-emerald-500 w-8 h-8 rounded-lg"></span> Shifa
        </h1>
        <div className="space-y-2 text-sm font-medium text-gray-500">
           <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">Dashboard</div>
           <div className="p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">Patients</div>
           <div className="p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer">Visits</div>
        </div>
      </div>
      
      <div className="flex-1 p-6 md:p-8">
        <Link to="/demo/doctor" className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-gray-900 w-fit">
          <ArrowLeft size={16}/> Switch Doctor
        </Link>
        
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome, {doc.name}</h2>
            <p className="text-gray-500">{doc.specialty}</p>
          </div>
          <button className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors">
            <Plus size={16}/> New Visit
          </button>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-5 border border-gray-100 shadow-sm rounded-2xl">
              <Users size={20} className="text-blue-500 mb-2"/>
              <p className="text-2xl font-bold">{doc.patientsToday}</p>
              <p className="text-xs text-gray-500">Patients Today</p>
           </div>
           <div className="bg-white p-5 border border-gray-100 shadow-sm rounded-2xl">
              <Zap size={20} className="text-orange-500 mb-2"/>
              <p className="text-2xl font-bold">{doc.pendingAI}</p>
              <p className="text-xs text-gray-500">AI Pending</p>
           </div>
        </div>
        
        <h3 className="font-bold text-lg mb-4 text-gray-900">Your Patients</h3>
        <div className="bg-white border text-sm border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Patient</th>
                <th className="p-4 font-semibold text-gray-600">Condition</th>
                <th className="p-4 font-semibold text-gray-600 hidden sm:table-cell">Last BP</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {demoPatients.map(p => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                  <td className="p-4">
                     <div className="font-bold text-gray-900">{p.name}</div>
                     <div className="text-xs text-gray-500">{p.age} y/o</div>
                  </td>
                  <td className="p-4 text-gray-700">{p.condition}</td>
                  <td className="p-4 text-gray-700 hidden sm:table-cell">{p.lastVitals.bp}</td>
                  <td className="p-4">
                     <Link to={`/demo/doctor/${doc.id}/patient/${p.id}`} className="text-blue-600 font-semibold hover:underline">
                        View Profile
                     </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}