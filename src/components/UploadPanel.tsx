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
  <label className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-neon/40 hover:bg-white/10">
    <span className="text-sm font-semibold uppercase tracking-wide text-slate-300">{label}</span>
    <div className="flex flex-col gap-2 text-slate-400">
      <span className="text-base font-medium text-white">Drop file or click to upload</span>
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
    className="glass-panel rounded-3xl border border-white/10 p-6 text-white shadow-glow"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex-1 min-w-0 space-y-4">
        <p className="text-sm text-slate-300">Upload your Netflix exports to unlock personalized insights.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileInput
            label="ViewingActivity.csv"
            hint="Required - powers watch, genre, device, and time analytics"
            accept=".csv"
            onChange={onViewingUpload}
          />
          <FileInput
            label="SearchHistory.csv"
            hint="Optional - enables search trends and word cloud"
            accept=".csv"
            onChange={onSearchUpload}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            <Upload size={14} /> CSV only
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            Auto cleaning enabled
          </span>
        </div>
      </div>
      <div className="w-full min-w-0 space-y-3 sm:max-w-sm">
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-aurora to-flare px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-0.5"
          onClick={onLoadSamples}
        >
          <Download size={16} />
          Load sample data
        </button>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-300">
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
