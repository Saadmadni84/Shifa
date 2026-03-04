import { Phone } from 'lucide-react'
import { format } from 'date-fns'

export default function VisitHeader({ visit }) {
  const { doctor, visitDate, patient } = visit
  return (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-5 pt-8 pb-8">
      <div className="flex items-center gap-2 mb-6 opacity-75">
        <span className="text-lg">🩺</span>
        <span className="font-bold tracking-tight">Shifa</span>
        <span className="text-emerald-200 text-xs ml-1">· Your Health Companion</span>
      </div>
      <p className="text-emerald-200 text-sm mb-0.5">Visit summary for</p>
      <h1 className="text-2xl font-extrabold tracking-tight mb-5">
        {patient?.firstName} {patient?.lastName}
      </h1>
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-white/20">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
          {(doctor?.firstName?.[0] ?? '')}
          {(doctor?.lastName?.[0] ?? '')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold">
            Dr. {doctor?.firstName} {doctor?.lastName}
          </p>
          <p className="text-emerald-200 text-sm">{doctor?.specialization}</p>
          {doctor?.clinicName && <p className="text-emerald-300 text-xs mt-0.5">{doctor.clinicName}</p>}
          <p className="text-emerald-200 text-xs mt-1">📅 {visitDate ? format(new Date(visitDate), 'EEEE, d MMMM yyyy') : '—'}</p>
        </div>
        {doctor?.phone && (
          <a
            href={`tel:${doctor.phone}`}
            className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors shrink-0 border border-white/20"
            aria-label="Call doctor"
          >
            <Phone size={18} />
          </a>
        )}
      </div>
    </div>
  )
}
