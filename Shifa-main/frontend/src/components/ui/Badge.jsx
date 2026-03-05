const V = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}
const DOTS = {
  default: 'bg-gray-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
}

export default function Badge({ children, variant = 'default', dot = false, className = '' }) {
  return (
    <span className={['inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', V[variant] ?? V.default, className].join(' ')}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOTS[variant] ?? DOTS.default}`} />}
      {children}
    </span>
  )
}

const VS = {
  DRAFT: { label: 'Draft', v: 'default' },
  NOTES_TAKEN: { label: 'Notes Taken', v: 'info' },
  AI_PROCESSING: { label: 'AI Processing…', v: 'purple' },
  REVIEWED: { label: 'Reviewed', v: 'warning' },
  SENT_TO_PATIENT: { label: 'Sent ✓', v: 'success' },
  COMPLETED: { label: 'Completed', v: 'success' },
}
export function VisitStatusBadge({ status }) {
  const c = VS[status] ?? { label: status, v: 'default' }
  return <Badge variant={c.v} dot>{c.label}</Badge>
}

const LANG = { HI: 'हिं', TA: 'த', TE: 'తె', BN: 'বাং', MR: 'म', GU: 'ગુ', KN: 'ಕ', ML: 'മ', PA: 'ਪੰ', EN: 'EN' }
export function LanguageBadge({ code }) {
  return <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">{LANG[code] ?? code}</span>
}
