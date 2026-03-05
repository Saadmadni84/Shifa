import { AlertCircle } from 'lucide-react'

const timingEmoji = (t) => {
  t = t?.toLowerCase() ?? ''
  if (t.includes('morning') || t.includes('breakfast') || t.includes('subah')) return '🌅'
  if (t.includes('afternoon') || t.includes('lunch')) return '☀️'
  if (t.includes('evening') || t.includes('shaam')) return '🌆'
  if (t.includes('night') || t.includes('sleep') || t.includes('raat')) return '🌙'
  if (t.includes('before meal') || t.includes('empty stomach')) return '🫙'
  if (t.includes('after meal')) return '🍛'
  return '💊'
}

function Chip({ label, value }) {
  if (!value) return null
  return (
    <div className="bg-gray-50 rounded-xl p-2 text-center">
      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-xs font-bold text-gray-800 mt-0.5 leading-snug">{value}</p>
    </div>
  )
}

export default function MedicineSchedule({ medications = [] }) {
  if (!medications.length)
    return (
      <div className="px-4 py-10 text-center text-gray-400 text-sm">
        <span className="text-3xl block mb-2">💊</span>
        No medicines prescribed for this visit.
      </div>
    )
  return (
    <div className="px-4 py-2 space-y-3">
      {medications.map((med, i) => (
        <div key={`${med.name}-${i}`} className={`rounded-2xl border p-4 space-y-3 ${med.critical ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 leading-tight">{med.name}</h3>
                {med.critical && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    <AlertCircle size={10} />
                    IMPORTANT
                  </span>
                )}
              </div>
              {med.genericName && <p className="text-xs text-gray-400 mt-0.5">{med.genericName}</p>}
            </div>
            <span className="text-2xl leading-none shrink-0">{timingEmoji(med.timing)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Chip label="Dose" value={med.dosage} />
            <Chip label="When" value={med.frequency} />
            <Chip label="Timing" value={med.timing} />
          </div>
          {(med.durationDays || med.quantity) && (
            <p className="text-xs text-gray-600">
              📅 {med.durationDays ? `${med.durationDays} days` : ''}
              {med.quantity ? ` · ${med.quantity} tablets total` : ''}
            </p>
          )}
          {med.purpose && (
            <p className="text-xs text-gray-700 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
              <span className="font-semibold">Why: </span>
              {med.purpose}
            </p>
          )}
          {med.sideEffectsToWatch?.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
              <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Watch for:</p>
              {med.sideEffectsToWatch.map((s, j) => (
                <p key={j} className="text-xs text-amber-700 leading-relaxed">
                  {s}
                </p>
              ))}
            </div>
          )}
          {med.instructions && <p className="text-xs text-gray-500 italic leading-relaxed">💡 {med.instructions}</p>}
        </div>
      ))}
    </div>
  )
}
