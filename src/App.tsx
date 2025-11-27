import { useMemo, useState } from 'react'
import Papa from 'papaparse'
import { motion } from 'framer-motion'
import { Activity, Calendar, Clock3, PlayCircle, Search, Sparkles } from 'lucide-react'

import { UploadPanel } from './components/UploadPanel'
import { MetricCard } from './components/MetricCard'
import { SectionHeader } from './components/SectionHeader'
import { WatchTrend } from './components/charts/WatchTrend'
import { GenreChart } from './components/charts/GenreChart'
import { DeviceChart } from './components/charts/DeviceChart'
import { Heatmap } from './components/Heatmap'
import { InsightList } from './components/InsightList'
import { WordCloud } from './components/WordCloud'
import { SearchTrend } from './components/charts/SearchTrend'
import { TopTitles } from './components/TopTitles'
import { ViewingDistributionChart } from './components/charts/ViewingDistribution'

import type { RawSearchRow, RawViewingRow, SearchEntry, ViewingActivityEntry } from './types'
import {
  buildDeviceStats,
  buildGenreStats,
  buildHeatmap,
  buildDayDistribution,
  buildHourDistribution,
  buildTopTitles,
  buildTrend,
  buildSearchStats,
  createInsights,
  parseSearchRows,
  parseViewingRows,
  summarizeWatching,
} from './utils/analytics'

interface StatusState {
  viewing: string
  search: string
  error?: string | null
}

const formatHours = (minutes: number) => `${Math.round(minutes / 60)} hrs`

function App() {
  const [viewingData, setViewingData] = useState<ViewingActivityEntry[]>([])
  const [searchData, setSearchData] = useState<SearchEntry[]>([])
  const [status, setStatus] = useState<StatusState>({ viewing: 'Waiting', search: 'Optional' })
  const [isLoading, setIsLoading] = useState(false)

  const watchSummary = useMemo(() => summarizeWatching(viewingData), [viewingData])
  const trend = useMemo(() => buildTrend(viewingData), [viewingData])
  const genreStats = useMemo(() => buildGenreStats(viewingData), [viewingData])
  const deviceStats = useMemo(() => buildDeviceStats(viewingData), [viewingData])
  const heatmapData = useMemo(() => buildHeatmap(viewingData), [viewingData])
  const dayDistribution = useMemo(() => buildDayDistribution(viewingData), [viewingData])
  const hourDistribution = useMemo(() => buildHourDistribution(viewingData), [viewingData])
  const searchStats = useMemo(() => buildSearchStats(searchData), [searchData])
  const topTitles = useMemo(() => buildTopTitles(viewingData), [viewingData])
  const insights = useMemo(
    () => createInsights(watchSummary, genreStats, deviceStats, heatmapData, searchStats),
    [deviceStats, genreStats, heatmapData, searchStats, watchSummary],
  )

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>()
    viewingData.forEach((entry) => {
      map.set(entry.dayName, (map.get(entry.dayName) || 0) + entry.durationMinutes)
    })
    return Array.from(map.entries())
      .map(([day, minutes]) => ({ day, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
  }, [viewingData])

  const updateStatus = (partial: Partial<StatusState>) => setStatus((prev) => ({ ...prev, ...partial }))

  const parseViewingFile = (file: File) =>
    new Promise<ViewingActivityEntry[]>((resolve, reject) => {
      Papa.parse<RawViewingRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<RawViewingRow>) => {
          if (results.errors.length) {
            reject(results.errors[0].message)
            return
          }
          resolve(parseViewingRows(results.data))
        },
        error: (error: Error) => reject(error.message),
      })
    })

  const parseSearchFile = (file: File) =>
    new Promise<SearchEntry[]>((resolve, reject) => {
      Papa.parse<RawSearchRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<RawSearchRow>) => {
          if (results.errors.length) {
            reject(results.errors[0].message)
            return
          }
          resolve(parseSearchRows(results.data))
        },
        error: (error: Error) => reject(error.message),
      })
    })

  const handleViewingUpload = async (file: File) => {
    try {
      setIsLoading(true)
      updateStatus({ viewing: 'Uploading…', error: null })
      const entries = await parseViewingFile(file)
      setViewingData(entries)
      updateStatus({ viewing: `${entries.length} rows processed` })
    } catch (error) {
      updateStatus({ viewing: 'Failed', error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchUpload = async (file: File) => {
    try {
      setIsLoading(true)
      updateStatus({ search: 'Uploading…', error: null })
      const entries = await parseSearchFile(file)
      setSearchData(entries)
      updateStatus({ search: `${entries.length} searches` })
    } catch (error) {
      updateStatus({ search: 'Failed', error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSampleData = async () => {
    try {
      setIsLoading(true)
      updateStatus({ viewing: 'Loading sample…', search: 'Loading sample…', error: null })
      const [viewingText, searchText] = await Promise.all([
        fetch('/sample-viewing-activity.csv').then((response) => response.text()),
        fetch('/sample-search-history.csv').then((response) => response.text()),
      ])
      const viewingRows = Papa.parse<RawViewingRow>(viewingText, { header: true, skipEmptyLines: true }).data
      const searchRows = Papa.parse<RawSearchRow>(searchText, { header: true, skipEmptyLines: true }).data
      setViewingData(parseViewingRows(viewingRows))
      setSearchData(parseSearchRows(searchRows))
      updateStatus({ viewing: 'Sample loaded', search: 'Sample loaded' })
    } catch (error) {
      updateStatus({ error: String(error), viewing: 'Failed', search: 'Failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-bg min-h-screen px-4 py-10 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <motion.header
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#05030a]/95 via-[#0c0720]/90 to-[#05030a]/95 p-8 shadow-glow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
              <Sparkles size={14} /> Netflix insight engine
            </p>
            <div>
              <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Netflix Review - turn raw files into vivid stories
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-300">
                Upload your downloaded Netflix data and instantly uncover what you watch, when you binge, which genres you crave,
                and how your search habits guide every session. Animated charts keep the experience fresh and human.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:-translate-y-0.5"
                onClick={loadSampleData}
              >
                Try the included sample dataset
              </button>
              <a
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm text-slate-200"
                href="https://www.netflix.com/account/getmyinfo"
                target="_blank"
                rel="noreferrer"
              >
                Need help exporting data?
              </a>
            </div>
          </div>
        </motion.header>

        <motion.section
          className="glass-panel grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MetricCard label="Total hours" value={`${watchSummary.totalHours} h`} sublabel="Tracked play time" icon={<Clock3 size={16} />} />
          <MetricCard label="Sessions" value={`${watchSummary.totalSessions}`} sublabel="Individual streams" icon={<PlayCircle size={16} />} />
          <MetricCard label="Peak day" value={watchSummary.peakDay} sublabel={watchSummary.peakHourRange} icon={<Calendar size={16} />} />
          <MetricCard
            label="All-time favorite"
            value={watchSummary.topTitle?.value || '--'}
            sublabel={watchSummary.topTitle ? `${watchSummary.topTitle.count} hrs viewed` : 'Upload data to reveal it'}
            icon={<Activity size={16} />}
          />
        </motion.section>

        <UploadPanel
          onViewingUpload={handleViewingUpload}
          onSearchUpload={handleSearchUpload}
          onLoadSamples={loadSampleData}
          viewingStatus={status.viewing}
          searchStatus={status.search}
          loading={isLoading}
        />

        {status.error && <p className="text-sm text-rose-300">{status.error}</p>}

        <section className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Watch history" subtitle="Total hours and cadence per month" />
            <WatchTrend data={trend} />
          </div>
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Most watched" subtitle="Top stories on repeat" />
            <TopTitles items={topTitles} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Genre energy" subtitle="Where your attention gravitates" />
            <GenreChart data={genreStats} />
          </div>
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Device mix" subtitle="Screens you stream on" />
            <DeviceChart data={deviceStats} />
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {deviceStats.length ? (
                deviceStats.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <span>{device.device}</span>
                    <span className="text-white">{formatHours(device.minutes)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Devices appear once viewing data is ready.</p>
              )}
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-3xl border border-white/10 p-6">
          <SectionHeader title="Binge heatmap" subtitle="Weekday versus weekend rhythm" />
          <Heatmap data={heatmapData} />
        </section>

        <section className="glass-panel rounded-3xl border border-white/10 p-6">
          <SectionHeader title="Viewing distribution" subtitle="Histogram inspired readouts with smoothed trendline" />
          <div className="grid gap-6">
            <ViewingDistributionChart
              title="Daily cadence"
              xLabel="Day of month"
              color="#f87171"
              lineColor="#dc2626"
              data={dayDistribution}
            />
            <ViewingDistributionChart
              title="Hourly pulse"
              xLabel="Hour of day"
              color="#60a5fa"
              lineColor="#1d4ed8"
              data={hourDistribution}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Day pacing" subtitle="Which days steal the watch crown" />
            {dayTotals.length ? (
              <div className="grid gap-3">
                {dayTotals.map((item) => (
                  <div key={item.day} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock3 size={16} className="text-neon" />
                      <span>{item.day}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{formatHours(item.minutes)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Upload viewing data to surface day-level pacing.</p>
            )}
          </div>
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Personalized insights" subtitle="Generated from your unique habits" />
            <InsightList items={insights} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Search pulse" subtitle="Queries per month" />
            <SearchTrend data={searchStats.monthlyCounts} />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Total searches" value={`${searchStats.totalQueries}`} sublabel="Across Netflix" icon={<Search size={16} />} />
              <MetricCard
                label="Most searched"
                value={searchStats.topSearches[0]?.value || '--'}
                sublabel={searchStats.topSearches[0] ? `${searchStats.topSearches[0].count} times` : 'Need SearchHistory.csv'}
                icon={<Sparkles size={16} />}
              />
              <MetricCard
                label="Unique keywords"
                value={`${searchStats.wordCloud.length}`}
                sublabel="after cleaning"
                icon={<Activity size={16} />}
              />
            </div>
          </div>
          <div className="glass-panel rounded-3xl border border-white/10 p-6">
            <SectionHeader title="Search word cloud" subtitle="Your most common discovery terms" />
            <WordCloud tokens={searchStats.wordCloud} />
          </div>
        </section>

        <footer className="text-center text-xs text-slate-500">
          Netflix Review • Built with React, Vite, Tailwind, Recharts, and a sprinkle of Framer Motion.
        </footer>
      </div>
    </div>
  )
}

export default App
