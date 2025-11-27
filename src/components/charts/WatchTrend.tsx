import { CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, Line } from 'recharts'
import type { TrendPoint } from '../../types'

interface WatchTrendProps {
  data: TrendPoint[]
}

const axisStyle = { fill: '#e5e5e5', fontSize: 12 }

export const WatchTrend = ({ data }: WatchTrendProps) => {
  if (!data.length) {
    return <p className="text-sm text-brandMuted">Upload viewing data to populate this chart.</p>
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
        <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis tickLine={false} axisLine={false} tick={axisStyle} width={60} tickFormatter={(value) => `${Math.round(value / 60)}h`} />
        <Tooltip
          contentStyle={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem' }}
          formatter={(value: number) => [`${Math.round((value as number) / 60)} hrs`, 'Watch time']}
        />
        <Bar dataKey="minutes" barSize={18} radius={[6, 6, 0, 0]} fill="#E50914" fillOpacity={0.9} />
        <Line type="monotone" dataKey="smooth" stroke="#F67C7C" strokeWidth={3} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
