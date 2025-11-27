import type { Insight } from '../types'
import { motion } from 'framer-motion'

interface InsightListProps {
  items: Insight[]
}

export const InsightList = ({ items }: InsightListProps) => {
  if (!items.length) {
    return <p className="text-sm text-slate-400">Insights appear after we crunch your viewing data.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((insight, index) => (
        <motion.div
          key={insight.label}
          className="glass-panel rounded-2xl border border-white/10 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{insight.label}</p>
          <p className="mt-2 text-lg font-semibold text-white">{insight.highlight}</p>
          <p className="mt-1 text-sm text-slate-300">{insight.detail}</p>
        </motion.div>
      ))}
    </div>
  )
}
