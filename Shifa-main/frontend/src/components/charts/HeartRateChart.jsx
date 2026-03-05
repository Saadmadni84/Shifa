import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts'
import { format } from 'date-fns'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-red-600">
        {payload[0]?.value} <span className="font-normal text-gray-500">bpm</span>
      </p>
    </div>
  )
}

export default function HeartRateChart({ data = [], normalMin = 60, normalMax = 100 }) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.recordedAt ? format(new Date(d.recordedAt), 'MMM d') : d.label,
    value: d.heartRate ?? d.value,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Resting Heart Rate Trend</h3>
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">bpm</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={normalMin} stroke="#86efac" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={normalMax} stroke="#86efac" strokeDasharray="4 4" strokeWidth={1} />
          <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#hrGrad)" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#ef4444' }} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-green-300 rounded inline-block" />
          {normalMin}–{normalMax} bpm normal
        </span>
      </div>
    </div>
  )
}
