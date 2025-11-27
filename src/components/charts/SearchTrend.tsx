import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrendPoint } from '../../types'

interface SearchTrendProps {
  data: TrendPoint[]
}

export const SearchTrend = ({ data }: SearchTrendProps) => {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Upload SearchHistory.csv to see query trends.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: '#05030a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '1rem' }}
          formatter={(value: number) => [`${value} searches`, 'Searches']}
        />
        <Line type="monotone" dataKey="minutes" stroke="#f472b6" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
