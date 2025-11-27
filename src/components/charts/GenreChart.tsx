import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GenreStat } from '../../types'

interface GenreChartProps {
  data: GenreStat[]
}

export const GenreChart = ({ data }: GenreChartProps) => {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Genre breakdown appears once viewing data is loaded.</p>
  }

  const chartData = data.map((item) => ({ label: item.genre, minutes: item.minutes }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
        <XAxis type="number" hide />
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={120} tick={{ fill: '#e2e8f0', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: '#05030a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '1rem' }}
          formatter={(value: number) => [`${Math.round(value / 60)} hrs`, 'Watch time']}
        />
        <Bar dataKey="minutes" radius={[0, 12, 12, 0]} fill="url(#genreGradient)">
          <defs>
            <linearGradient id="genreGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#7f5af0" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
