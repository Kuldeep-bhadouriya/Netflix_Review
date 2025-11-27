interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
)
