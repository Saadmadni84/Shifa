import { format } from 'date-fns'

const STEPS = ['NOT_SENT', 'SENT', 'DELIVERED', 'READ']
const TICKS = {
  SENT: { t: '✓', c: 'text-gray-500', bg: 'bg-gray-100' },
  DELIVERED: { t: '✓✓', c: 'text-gray-600', bg: 'bg-emerald-100' },
  READ: { t: '✓✓', c: 'text-blue-500', bg: 'bg-blue-50' },
}

export default function WhatsAppStatusBadge({ status, readAt }) {
  if (status === 'NOT_SENT') return <span className="text-xs text-gray-400">Not sent</span>
  if (status === 'FAILED') return <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-600 px-2.5 py-1 rounded-full">✕ Failed</span>
  const step = STEPS.indexOf(status)
  const t = TICKS[status] ?? TICKS.SENT
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${t.bg}`}>
        <span className={t.c}>{t.t}</span>
        <span className={status === 'READ' ? 'text-blue-600' : 'text-gray-600'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
      </span>
      <div className="flex items-center gap-1 pl-1">
        {STEPS.slice(1).map((s, i) => (
          <div key={s} className={`w-1.5 h-1.5 rounded-full ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
        ))}
        {readAt && <span className="text-[10px] text-gray-400 ml-1">{format(new Date(readAt), 'd MMM, h:mm a')}</span>}
      </div>
    </div>
  )
}
