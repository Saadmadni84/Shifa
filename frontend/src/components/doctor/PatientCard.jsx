import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { LanguageBadge } from '../ui/Badge'
import { formatDistanceToNow } from 'date-fns'

export default function PatientCard({ patient, onClick }) {
  const navigate = useNavigate()
  const lastDate = patient.visits?.[0]?.visitDate ?? patient.lastVisitDate
  const timeAgo = lastDate ? formatDistanceToNow(new Date(lastDate), { addSuffix: true }) : 'No visits yet'
  const handle = () => (onClick ? onClick(patient) : navigate(`/doctor/patients/${patient.id}`))

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handle}
      onKeyDown={(e) => e.key === 'Enter' && handle()}
      className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/80 cursor-pointer transition-colors border-b border-gray-100 last:border-0 group"
    >
      <Avatar
        firstName={patient.firstName}
        lastName={patient.lastName}
        src={patient.profilePhotoUrl}
        size="md"
        badge={
          patient.unreadCount > 0 ? (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {patient.unreadCount > 9 ? '9+' : patient.unreadCount}
            </span>
          ) : null
        }
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {patient.firstName} {patient.lastName}
          </p>
          <LanguageBadge code={patient.preferredLanguage ?? 'HI'} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-400">{timeAgo}</p>
          {patient.chronicConditions?.[0] && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">{patient.chronicConditions[0]}</span>}
        </div>
      </div>
      <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
    </div>
  )
}
