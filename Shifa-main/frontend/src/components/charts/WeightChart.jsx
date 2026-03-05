import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { format } from 'date-fns'

function Delta({ x, y, width, value, avg }) {
  const delta = value - avg
  if (Math.abs(delta) < 0.05) return null
  const positive = delta > 0
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={10} fill={positive ? '#ef4444' : '#10b981'} fontWeight={600}>
      {positive ? '+' : ''}
      {delta.toFixed(1)}
    </text>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900">
        {payload[0]?.value?.toFixed(1)} <span className="font-normal text-gray-500">kg</span>
      </p>
    </div>
  )
}

export default function WeightChart({ data = [] }) {
  const formatted = data.map((d) => ({ ...d, label: d.recordedAt ? format(new Date(d.recordedAt), 'MMM d') : d.label, value: d.weightKg ?? d.value }))
  const avg = formatted.length ? formatted.reduce((s, d) => s + d.value, 0) / formatted.length : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Weight Trend</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">Avg: {avg.toFixed(1)} kg</span>
          {formatted.length >= 2 &&
            (() => {
              const delta = formatted.at(-1).value - formatted[0].value
              return (
                <span className={`font-bold px-2 py-0.5 rounded-lg ${delta > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(1)} kg
                </span>
              )
            })()}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avg} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1.5} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={24} label={<Delta avg={avg} />}>
            {formatted.map((_, i) => (
              <Cell key={i} fill={i === formatted.length - 1 ? '#818cf8' : '#a5b4fc'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
