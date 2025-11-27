import { motion } from 'framer-motion'
import { Upload, Download } from 'lucide-react'

interface UploadPanelProps {
  onViewingUpload: (file: File) => void
  onSearchUpload: (file: File) => void
  onLoadSamples: () => void
  viewingStatus?: string
  searchStatus?: string
  loading?: boolean
}

const FileInput = ({ label, hint, accept, onChange }: { label: string; hint: string; accept: string; onChange: (file: File) => void }) => (
  <label className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-panel/60 p-5 transition hover:border-white/40">
    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brandMuted">{label}</span>
    <div className="flex flex-col gap-2 text-brandMuted">
      <span className="text-base font-medium text-white">Drag files here or browse</span>
      <span className="text-xs">{hint}</span>
    </div>
    <input
      type="file"
      accept={accept}
      className="hidden"
      onChange={(event) => {
        const file = event.currentTarget.files?.[0]
        if (file) onChange(file)
        event.currentTarget.value = ''
      }}
    />
  </label>
)

export const UploadPanel = ({
  onViewingUpload,
  onSearchUpload,
  onLoadSamples,
  viewingStatus,
  searchStatus,
  loading,
}: UploadPanelProps) => (
  <motion.section
    className="rounded-[28px] border border-white/5 bg-panel/80 p-6 text-white shadow-panel"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex-1 min-w-0 space-y-4">
        <p className="text-sm text-brandMuted">Upload the CSVs Netflix emails to you and keep everything processed locally.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileInput
            label="ViewingActivity.csv"
            hint="Required - fuels watch time, devices, and cadence"
            accept=".csv"
            onChange={onViewingUpload}
          />
          <FileInput
            label="SearchHistory.csv"
            hint="Optional - powers search trends and word cloud"
            accept=".csv"
            onChange={onSearchUpload}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-brandMuted">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            <Upload size={14} /> CSV only
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            Local processing only
          </span>
        </div>
      </div>
      <div className="w-full min-w-0 space-y-3 sm:max-w-sm">
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brandAccent"
          onClick={onLoadSamples}
        >
          <Download size={16} />
          Preview with sample profile
        </button>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-brandMuted">
          <p className="font-semibold text-white">Status</p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center justify-between">
              <span>Viewing activity</span>
              <span className="text-white">{viewingStatus || 'Waiting'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Search history</span>
              <span className="text-white">{searchStatus || 'Optional'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Processing</span>
              <span className="text-white">{loading ? 'Parsing…' : 'Idle'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </motion.section>
)
