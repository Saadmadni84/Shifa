import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus, ArrowRight, UserPlus, FileText, CheckCircle2 } from 'lucide-react'

import DoctorLayout from '@/components/layout/DoctorLayout'
import Button from '@/components/ui/Button'
import { DEMO_DOCTOR, DEMO_PATIENTS } from '@/data/demo/doctorDemoData'

export default function NewVisitPage() {
  const navigate = useNavigate()
  const { doctorId } = useParams()
  const [searchParams] = useSearchParams()
  const presetPatientId = searchParams.get('patient')

  const [selectedPatientId, setSelectedPatientId] = useState(presetPatientId || '')
  const [notes, setNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedPatient = DEMO_PATIENTS.find(p => p.id === selectedPatientId)

  const handleSimulateAI = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // In a real flow, this would redirect to the generated AI visit detail.
      // We bounce back to the patient profile for demo flow completeness.
      navigate(`/demo/doctor/${doctorId}/patient/${selectedPatientId}`);
    }, 2000);
  }

  return (
    <DoctorLayout doctor={DEMO_DOCTOR}>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Consultation</h1>
          <p className="text-gray-500">Record a visit and generate an AI clinical summary</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Patient Selection */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">1. Select Patient</h2>
            <select 
              value={selectedPatientId} 
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="" disabled>Select a patient from your list...</option>
              {DEMO_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} - {p.phone}</option>
              ))}
            </select>
          </div>

          {/* AI Intake / Notes */}
          <div className={`p-6 transition-opacity ${!selectedPatientId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide flex justify-between">
              <span>2. Clinical Notes</span>
              {selectedPatientId && <span className="text-emerald-600 normal-case font-medium">Recording for {selectedPatient?.firstName}</span>}
            </h2>
            
            <div className="space-y-4">
              <textarea 
                rows={6}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Type your notes here, or use voice dictation..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
              />

              <div className="flex gap-3">
                <Button 
                  variant={isRecording ? 'danger' : 'secondary'} 
                  onClick={() => setIsRecording(!isRecording)}
                  className="w-40"
                >
                  {isRecording ? 'Stop Recording' : 'Start Dictation'}
                </Button>
                
                <Button 
                  variant="primary" 
                  className="flex-1"
                  disabled={!selectedPatientId || isProcessing}
                  onClick={handleSimulateAI}
                >
                  {isProcessing ? 'Generating AI Summary...' : 'Process with AI'} 
                  {!isProcessing && <ArrowRight size={16} className="ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}
