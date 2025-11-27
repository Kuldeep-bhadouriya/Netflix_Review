import type { HeatmapPoint } from '../types'

interface HeatmapProps {
  data: HeatmapPoint[]
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const BUCKETS = Array.from({ length: 8 }, (_, index) => index * 3)

const bucketLabel = (start: number) => {
  const end = (start + 3) % 24
  const label = (value: number) => {
    const hour = value % 12 || 12
    const suffix = value >= 12 ? 'PM' : 'AM'
    return `${hour}${suffix}`
  }
  return `${label(start)}-${label(end)}`
}

export const Heatmap = ({ data }: HeatmapProps) => {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Upload viewing data to unlock your binge heatmap.</p>
  }

  const matrix = new Map<string, number>()
  data.forEach((point) => {
    const bucket = Math.floor(point.hour / 3) * 3
    const key = `${point.day}-${bucket}`
    matrix.set(key, (matrix.get(key) || 0) + point.value)
  })

  const maxValue = Math.max(...matrix.values(), 1)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="w-24 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Day</th>
            {BUCKETS.map((bucket) => (
              <th key={bucket} className="min-w-[90px] text-xs font-semibold uppercase tracking-wide text-slate-400">
                {bucketLabel(bucket)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_ORDER.map((day) => (
            <tr key={day}>
              <td className="text-sm font-medium text-white">{day}</td>
              {BUCKETS.map((bucket) => {
                const value = matrix.get(`${day}-${bucket}`) || 0
                const intensity = value / maxValue
                const background = `linear-gradient(135deg, rgba(127,90,240,${0.15 + intensity * 0.6}), rgba(34,211,238,${0.15 + intensity * 0.4}))`
                return (
                  <td key={bucket} className="rounded-lg px-2 py-3 text-center text-xs font-semibold text-white/90" style={{ background }}>
                    {value ? `${Math.round(value / 6)} min` : '--'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
