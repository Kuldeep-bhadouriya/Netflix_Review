import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DeviceStat } from '../../types'

interface DeviceChartProps {
  data: DeviceStat[]
}

const COLORS = ['#22d3ee', '#7f5af0', '#f472b6', '#facc15', '#38bdf8']

export const DeviceChart = ({ data }: DeviceChartProps) => {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Device breakdown will appear after data upload.</p>
  }

  const chartData = data.map((item) => ({ device: item.device, minutes: item.minutes }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="minutes" nameKey="device">
          {chartData.map((entry, index) => (
            <Cell key={entry.device} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#05030a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '1rem' }}
          formatter={(value: number, name: string) => [`${Math.round((value as number) / 60)} hrs`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
