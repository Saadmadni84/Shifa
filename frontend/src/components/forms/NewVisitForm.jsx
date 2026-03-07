import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import { createVisit } from '@/api'
import PatientSearch from '../doctor/PatientSearch'
import VoiceInput from '../doctor/VoiceInput'
import { Textarea } from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const VISIT_TYPES = ['Office Visit', 'Follow-up', 'Telemedicine', 'Emergency', 'Procedure', 'Lab Review']

export default function NewVisitForm({ onSuccess }) {
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { visitType: 'Office Visit' },
  })
  const notes = watch('doctorNotes', '')

  const handleVoiceTranscript = (text, isFinal) => {
    if (isFinal) setValue('doctorNotes', (notes ? `${notes} ` : '') + text)
  }

  const submit = async (data) => {
    if (!patient) {
      toast.error('Please select a patient')
      return
    }
    setLoading(true)
    try {
      const visit = await createVisit({
        patientId: patient.id,
        visitType: data.visitType,
        chiefComplaint: data.doctorNotes,
        rawNotes: data.doctorNotes,
      })
      toast.success('Visit created! AI is processing…')
      onSuccess?.(visit) || navigate(`/doctor/visits/${visit.id}/review`)
    } catch (err) {
      toast.error(err.message ?? 'Failed to create visit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Patient <span className="text-red-500">*</span>
        </label>
        <PatientSearch onSelect={setPatient} />
        {patient && (
          <div className="flex items-center gap-2 mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <p className="text-sm font-medium text-emerald-800">
              {patient.firstName} {patient.lastName}
            </p>
            <button type="button" onClick={() => setPatient(null)} className="ml-auto text-emerald-400 hover:text-emerald-600 text-xs">
              Change
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Visit Type</label>
        <div className="flex flex-wrap gap-2">
          {VISIT_TYPES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" value={t} {...register('visitType')} className="sr-only peer" />
              <span className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500 transition-all hover:border-gray-400 select-none">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Doctor&apos;s Notes <span className="text-red-500">*</span>
          </label>
          <VoiceInput onTranscript={handleVoiceTranscript} language="en-IN" />
        </div>
        <Textarea
          id="doctorNotes"
          rows={5}
          placeholder="Chief complaint, examination findings, diagnosis, treatment plan…"
          error={errors.doctorNotes?.message}
          {...register('doctorNotes', { required: 'Please enter visit notes', minLength: { value: 20, message: 'Please add more detail (min 20 chars)' } })}
        />
        <p className="text-xs text-gray-400">The AI will structure these notes into a patient summary. Be as detailed as needed.</p>
      </div>

      <Button type="submit" loading={loading} fullWidth size="lg" leftIcon={<Stethoscope size={16} />}>
        Create Visit & Process with AI
      </Button>
    </form>
  )
}
