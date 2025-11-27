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
    className="glass-panel flex min-h-[150px] flex-col gap-3 rounded-2xl border border-white/10 p-5"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.2em] text-slate-200">
      {icon}
      <span className="break-words leading-tight text-white/90">{label}</span>
    </div>
    <div className="text-3xl font-semibold leading-tight text-white sm:text-[2.75rem]">{value}</div>
    {sublabel && <p className="text-sm text-slate-300">{sublabel}</p>}
    {accent && <span className="text-xs font-semibold text-neon">{accent}</span>}
  </motion.div>
)
