interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{title}</h2>
      {subtitle && <p className="text-sm text-brandMuted">{subtitle}</p>}
    </div>
    {action}
  </div>
)
