import { Brain, CheckCircle2, XCircle, Clock } from 'lucide-react'

const CFG = {
  DRAFT: { icon: <Clock size={13} />, label: 'Awaiting Notes', cls: 'bg-gray-100 text-gray-500', pulse: false },
  NOTES_TAKEN: { icon: <Clock size={13} />, label: 'Ready to Process', cls: 'bg-blue-100 text-blue-600', pulse: false },
  AI_PROCESSING: { icon: <Brain size={13} />, label: 'AI Processing…', cls: 'bg-purple-100 text-purple-700', pulse: true },
  REVIEWED: { icon: <CheckCircle2 size={13} />, label: 'Summary Ready', cls: 'bg-emerald-100 text-emerald-700', pulse: false },
  SENT_TO_PATIENT: { icon: <CheckCircle2 size={13} />, label: 'Sent to Patient', cls: 'bg-emerald-100 text-emerald-700', pulse: false },
  COMPLETED: { icon: <CheckCircle2 size={13} />, label: 'Completed', cls: 'bg-gray-100 text-gray-600', pulse: false },
  AI_FAILED: { icon: <XCircle size={13} />, label: 'AI Failed', cls: 'bg-red-100 text-red-600', pulse: false },
}

export default function AIStatusBadge({ status, className = '' }) {
  const c = CFG[status] ?? CFG.DRAFT
  return (
    <span className={['inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full', c.cls, c.pulse ? 'animate-pulse' : '', className].join(' ')}>
      {c.icon}
      {c.label}
    </span>
  )
}
