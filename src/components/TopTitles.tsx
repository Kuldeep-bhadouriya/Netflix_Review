import type { TopTitleStat } from '../types'

interface TopTitlesProps {
  items: TopTitleStat[]
}

export const TopTitles = ({ items }: TopTitlesProps) => {
  if (!items.length) {
    return <p className="text-sm text-slate-400">Top titles will appear once viewing data is processed.</p>
  }

  const maxMinutes = Math.max(...items.map((item) => item.minutes)) || 1

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-slate-200">
            <div>
              <p className="font-semibold text-white">{item.title}</p>
              <p className="text-xs text-slate-400">{item.genre}</p>
            </div>
            <span className="text-xs font-semibold text-neon">{Math.round(item.minutes / 60)} hrs</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon to-aurora"
              style={{ width: `${(item.minutes / maxMinutes) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
