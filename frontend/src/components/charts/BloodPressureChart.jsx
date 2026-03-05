import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.value} <span className="font-normal text-gray-400">mmHg</span>
        </p>
      ))}
    </div>
  )
}

export default function BloodPressureChart({ data = [] }) {
  const formatted = data.map((d) => ({
    label: d.recordedAt ? format(new Date(d.recordedAt), 'MMM d') : d.label,
    systolic: d.bloodPressureSystolic ?? d.systolic,
    diastolic: d.bloodPressureDiastolic ?? d.diastolic,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Blood Pressure Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[50, 180]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
          <ReferenceLine y={130} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1} label={{ value: '130', fontSize: 10, fill: '#fca5a5' }} />
          <ReferenceLine y={80} stroke="#86efac" strokeDasharray="4 4" strokeWidth={1} />
          <Line name="Systolic" type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Line name="Diastolic" type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
