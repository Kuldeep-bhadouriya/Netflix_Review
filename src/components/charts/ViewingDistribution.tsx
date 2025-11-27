import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar } from 'recharts'
import type { DistributionPoint } from '../../types'

interface ViewingDistributionProps {
  title: string
  color: string
  lineColor: string
  data: DistributionPoint[]
  xLabel: string
}

const axisStyle = { fill: '#cbd5f5', fontSize: 12 }

export const ViewingDistributionChart = ({ title, color, lineColor, data, xLabel }: ViewingDistributionProps) => {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Upload viewing data to view this distribution.</p>
  }

  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-black/20 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
        <p className="text-sm text-slate-400">{xLabel}</p>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisStyle} minTickGap={8} />
            <YAxis tickLine={false} axisLine={false} tick={axisStyle} width={60} tickFormatter={(value) => `${Math.round(value / 60)}h`} />
            <Tooltip
              contentStyle={{ background: '#030712', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '1rem' }}
              formatter={(value: number) => [`${Math.round((value as number) / 60)} hrs`, 'Watch time']}
            />
            <Bar dataKey="value" barSize={12} fill={color} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="smooth" stroke={lineColor} strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
