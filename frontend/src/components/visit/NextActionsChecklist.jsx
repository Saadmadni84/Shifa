import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

export default function NextActionsChecklist({ actions = [] }) {
  const [checked, setChecked] = useState({})
  const toggle = (i) => setChecked((c) => ({ ...c, [i]: !c[i] }))
  const done = Object.values(checked).filter(Boolean).length

  if (!actions.length) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
            <span className="text-base">✅</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Your Next Actions</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {done}/{actions.length} completed
            </p>
          </div>
        </div>
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f3f4f6" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray={`${actions.length > 0 ? (done / actions.length) * 100 : 0} 100`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600">{Math.round((done / Math.max(actions.length, 1)) * 100)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={[
              'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150',
              checked[i] ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
            ].join(' ')}
          >
            {checked[i] ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> : <Circle size={18} className="text-gray-300     shrink-0 mt-0.5" />}
            <span className={`text-sm leading-relaxed ${checked[i] ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>{action}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
