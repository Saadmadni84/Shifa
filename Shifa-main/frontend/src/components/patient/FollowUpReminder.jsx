import { Calendar, Clock } from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'

export default function FollowUpReminder({ followUpInDays, followUpDate, visitDate, doctorName }) {
  const date = followUpDate ? new Date(followUpDate) : followUpInDays ? addDays(new Date(visitDate || new Date()), followUpInDays) : null
  if (!date) return null
  const left = differenceInDays(date, new Date())
  const urgent = left <= 2 ? 'bg-red-50 border-red-200' : left <= 7 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
  const iconCls = left <= 2 ? 'bg-red-100 text-red-600' : left <= 7 ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
  return (
    <div className={`mx-4 border-2 rounded-2xl p-4 ${urgent}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
          <Calendar size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold">Follow-up Visit Required</p>
          {doctorName && <p className="text-sm opacity-80 mt-0.5">Please visit Dr. {doctorName}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Clock size={13} className="opacity-70 shrink-0" />
            <p className="font-semibold text-sm">{format(date, 'EEEE, d MMMM yyyy')}</p>
          </div>
          {left >= 0 && <p className="text-xs opacity-70 mt-1">{left === 0 ? 'Today!' : left === 1 ? 'Tomorrow' : `In ${left} days`}</p>}
        </div>
      </div>
    </div>
  )
}
