import { CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, Line } from 'recharts'
import type { TrendPoint } from '../../types'

interface WatchTrendProps {
  data: TrendPoint[]
}

const axisStyle = { fill: '#cbd5f5', fontSize: 12 }

export const WatchTrend = ({ data }: WatchTrendProps) => {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Upload viewing data to populate this chart.</p>
  }

  const smoothed = data.map((item, index, arr) => {
    let sum = 0
    let count = 0
    for (let offset = -1; offset <= 1; offset += 1) {
      const neighbor = arr[index + offset]
      if (neighbor) {
        sum += neighbor.minutes
        count += 1
      }
    }
    return { ...item, smooth: Number((sum / count).toFixed(1)) }
  })

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={smoothed} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis tickLine={false} axisLine={false} tick={axisStyle} width={60} tickFormatter={(value) => `${Math.round(value / 60)}h`} />
        <Tooltip
          contentStyle={{ background: '#05030a', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '1rem' }}
          formatter={(value: number) => [`${Math.round((value as number) / 60)} hrs`, 'Watch time']}
        />
        <Bar dataKey="minutes" barSize={18} radius={[6, 6, 0, 0]} fill="#7f5af0" fillOpacity={0.85} />
        <Line type="monotone" dataKey="smooth" stroke="#22d3ee" strokeWidth={3} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
