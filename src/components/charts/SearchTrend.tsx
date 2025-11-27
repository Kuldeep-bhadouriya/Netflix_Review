import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrendPoint } from '../../types'

interface SearchTrendProps {
  data: TrendPoint[]
}

export const SearchTrend = ({ data }: SearchTrendProps) => {
  if (!data.length) {
    return <p className="text-sm text-brandMuted">Upload SearchHistory.csv to see query trends.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey="label" stroke="#d4d4d4" tickLine={false} axisLine={false} />
        <YAxis stroke="#d4d4d4" tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem' }}
          formatter={(value: number) => [`${value} searches`, 'Searches']}
        />
        <Line type="monotone" dataKey="minutes" stroke="#E50914" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
