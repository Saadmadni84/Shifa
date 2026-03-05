import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

export default function VitalsTrendMini({ data = [], color = '#10b981', height = 40 }) {
  const pts = data.map((v, i) => ({ i, v: typeof v === 'object' ? v.value : v }))
  if (pts.length < 2) return null
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={pts}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip contentStyle={{ display: 'none' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
