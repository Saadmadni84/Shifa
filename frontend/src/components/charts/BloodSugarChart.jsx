import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts'
import { format } from 'date-fns'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-amber-600">
        {payload[0]?.value} <span className="font-normal text-gray-500">mg/dL</span>
      </p>
    </div>
  )
}

export default function BloodSugarChart({ data = [], type = 'fasting' }) {
  const normal = type === 'fasting' ? { lo: 70, hi: 100 } : { lo: 70, hi: 140 }
  const formatted = data.map((d) => ({
    label: d.recordedAt ? format(new Date(d.recordedAt), 'MMM d') : d.label,
    value: type === 'fasting' ? (d.bloodSugarFasting ?? d.value) : (d.bloodSugarPostprandial ?? d.value),
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Blood Sugar {type === 'fasting' ? '(Fasting)' : '(Post-meal)'}</h3>
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
          Normal: {normal.lo}–{normal.hi} mg/dL
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="bsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={normal.lo} stroke="#86efac" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={normal.hi} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1} />
          <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#bsGrad)" dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
