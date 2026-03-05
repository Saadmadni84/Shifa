import { useNavigate } from 'react-router-dom'
import { ChevronRight, Brain, Send } from 'lucide-react'
import { VisitStatusBadge } from '../ui/Badge'
import { format } from 'date-fns'

export default function VisitRow({ visit, showPatient = true }) {
  const navigate = useNavigate()
  const d = visit.visitDate ? new Date(visit.visitDate) : null
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/doctor/visits/${visit.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/doctor/visits/${visit.id}`)}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 group"
    >
      <div className="w-12 text-center shrink-0">
        <p className="text-base font-bold text-gray-900 leading-tight">{d ? format(d, 'dd') : '—'}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{d ? format(d, 'MMM') : ''}</p>
      </div>
      <div className="flex-1 min-w-0">
        {showPatient && visit.patient && (
          <p className="font-semibold text-gray-900 text-sm truncate">
            {visit.patient.firstName} {visit.patient.lastName}
          </p>
        )}
        <p className="text-xs text-gray-500 truncate mt-0.5">{visit.chiefComplaint || visit.diagnosis || 'General consultation'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {visit.status === 'AI_PROCESSING' && <Brain size={14} className="text-purple-500 animate-pulse" />}
        {(visit.whatsappStatus === 'DELIVERED' || visit.whatsappStatus === 'READ') && <Send size={13} className="text-emerald-500" />}
        <VisitStatusBadge status={visit.status} />
      </div>
      <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
    </div>
  )
}
