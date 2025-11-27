import type { Insight } from '../types'
import { motion } from 'framer-motion'

interface InsightListProps {
  items: Insight[]
}

export const InsightList = ({ items }: InsightListProps) => {
  if (!items.length) {
    return <p className="text-sm text-brandMuted">Insights appear after we crunch your viewing data.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((insight, index) => (
        <motion.div
          key={insight.label}
          className="rounded-2xl border border-white/5 bg-panel/70 p-5 shadow-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-brandMuted">{insight.label}</p>
          <p className="mt-2 text-lg font-semibold text-white">{insight.highlight}</p>
          <p className="mt-1 text-sm text-brandMuted">{insight.detail}</p>
        </motion.div>
      ))}
    </div>
  )
}
