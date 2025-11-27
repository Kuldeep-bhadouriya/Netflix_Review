import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DeviceStat } from '../../types'

interface DeviceChartProps {
  data: DeviceStat[]
}

const COLORS = ['#E50914', '#B20710', '#F5F5F1', '#737373', '#2D2D2D']

export const DeviceChart = ({ data }: DeviceChartProps) => {
  if (!data.length) {
    return <p className="text-sm text-brandMuted">Device breakdown will appear after data upload.</p>
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
          contentStyle={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem' }}
          formatter={(value: number, name: string) => [`${Math.round((value as number) / 60)} hrs`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
