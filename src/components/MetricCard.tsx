import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  sublabel?: string
  accent?: string
  icon?: ReactNode
  delay?: number
}

export const MetricCard = ({ label, value, sublabel, accent, icon, delay = 0 }: MetricCardProps) => (
  <motion.div
    className="flex min-h-[150px] flex-col gap-3 rounded-2xl border border-white/5 bg-panel/80 p-5 shadow-panel"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-brandMuted">
      {icon}
      <span className="break-words leading-tight text-white/90">{label}</span>
    </div>
    <div className="text-3xl font-semibold leading-tight text-white sm:text-[2.75rem]">{value}</div>
    {sublabel && <p className="text-sm text-brandMuted">{sublabel}</p>}
    {accent && <span className="text-xs font-semibold text-brand">{accent}</span>}
  </motion.div>
)
