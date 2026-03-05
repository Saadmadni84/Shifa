const ST = {
  normal: { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Normal' },
  low: { bar: 'bg-blue-500', text: 'text-blue-600', label: 'Low' },
  high: { bar: 'bg-red-500', text: 'text-red-600', label: 'High' },
  unknown: { bar: 'bg-gray-300', text: 'text-gray-400', label: '—' },
}

function getStatus(v, lo, hi) {
  if (v == null || lo == null) return 'unknown'
  if (v < lo) return 'low'
  if (v > hi) return 'high'
  return 'normal'
}

export default function VitalCard({ emoji, label, value, unit, normalLow, normalHigh }) {
  const num = parseFloat(value)
  const st = getStatus(num, normalLow, normalHigh)
  const s = ST[st]
  const fill = normalLow != null && !Number.isNaN(num) ? Math.min(100, Math.max(5, ((num - normalLow) / (normalHigh - normalLow)) * 60 + 20)) : 50
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <p className="text-xs font-medium text-gray-500">{label}</p>
        </div>
        <span className={`text-xs font-bold ${s.text}`}>{s.label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-gray-900 leading-none">{value ?? '—'}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
      {normalLow != null && !Number.isNaN(num) && (
        <div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{ width: `${fill}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-400">{normalLow}</span>
            <span className="text-[9px] text-gray-400">{normalHigh}</span>
          </div>
        </div>
      )}
    </div>
  )
}
