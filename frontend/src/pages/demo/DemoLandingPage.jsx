import { Link } from 'react-router-dom';
import { User, Stethoscope } from 'lucide-react';

export default function DemoLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shifa Demo</h1>
        <p className="text-gray-500 mb-8">Choose your experience to explore the platform.</p>
        
        <div className="space-y-4">
          <Link to="/demo/scenarios" className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100">
            <div className="bg-emerald-500 text-white p-3 rounded-xl">
              <User size={24} />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-gray-900">Sign in as Patient</h2>
              <p className="text-sm text-gray-600">View WhatsApp summaries & AI Chat</p>
            </div>
          </Link>
          
          <Link to="/demo/doctor" className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
            <div className="bg-blue-500 text-white p-3 rounded-xl">
              <Stethoscope size={24} />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-gray-900">Sign in as Doctor</h2>
              <p className="text-sm text-gray-600">Explore Dashboard & EMR features</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}