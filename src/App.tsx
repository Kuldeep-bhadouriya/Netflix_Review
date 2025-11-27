import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [introDismissed, setIntroDismissed] = useState(false)
  const [revealStarted, setRevealStarted] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const revealTimerRef = useRef<number | null>(null)
  const retryTimerRef = useRef<number | null>(null)

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

  const startReveal = useCallback(() => {
    setRevealStarted((prev) => {
      if (prev) {
        return prev
      }
      revealTimerRef.current = window.setTimeout(() => {
        setIntroDismissed(true)
      }, 900)
      return true
    })
  }, [])

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current)
      }
    }
    const retryTimerId = retryTimerRef.current
    if (retryTimerId !== null) {
      window.clearTimeout(retryTimerId as number)
    }
  }, [])

  useEffect(() => {
    if (introDismissed) {
      document.body.classList.remove('intro-active')
    } else {
      document.body.classList.add('intro-active')
    }
    return () => {
      document.body.classList.remove('intro-active')
    }
  }, [introDismissed])

  const attemptVideoPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.muted = true
    const playAttempt = video.play()
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt
        .then(() => {
          setVideoError(null)
          window.setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = false
            }
          }, 250)
        })
        .catch(() => {
          setVideoError('Trying to start intro…')
          retryTimerRef.current = window.setTimeout(() => {
            attemptVideoPlayback()
          }, 800)
        })
    }
  }, [])

  useEffect(() => {
    if (introDismissed || !videoReady) {
      return
    }
    attemptVideoPlayback()
  }, [attemptVideoPlayback, introDismissed, videoReady])

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

  const handleVideoEnd = () => {
    startReveal()
  }

  return (
    <>
      {!introDismissed && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-[900ms] ${revealStarted ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/Loading_screen.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onEnded={handleVideoEnd}
            onError={() => {
              setVideoError('Intro video failed to load.')
              startReveal()
            }}
            controls={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 px-6 text-center">
            {!videoReady && <p className="text-xs uppercase tracking-[0.4em] text-white/70">Initializing intro…</p>}
            {videoError && <p className="text-xs text-brand">{videoError}</p>}
          </div>
        </div>
      )}
      <div
        className={`app-bg min-h-screen px-4 py-10 text-white transition-all duration-700 ease-out sm:px-8 ${revealStarted ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'}`}
      >
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <motion.header
          className="relative overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-br from-brandDark/90 via-brandDarker/85 to-black/80 p-8 sm:p-10 shadow-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-brandMuted">
              <Sparkles size={14} /> Netflix viewing profile
            </p>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                See your Netflix habits through a cinematic lens.
              </h1>
              <p className="max-w-2xl text-base text-brandMuted">
                Upload the official Netflix exports and watch your hours, devices, and searches reshape into the same bold aesthetic you
                know on TV. Everything renders locally -- no accounts, no tracking, just your viewing story.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brandAccent"
                onClick={loadSampleData}
              >
                Preview with sample profile
              </button>
              <a
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                href="https://www.netflix.com/account/getmyinfo"
                target="_blank"
                rel="noreferrer"
              >
                How to download your data
              </a>
            </div>
          </div>
        </motion.header>

        <motion.section
          className="grid gap-5 rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel sm:grid-cols-2 xl:grid-cols-4"
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

        {status.error && <p className="text-sm text-brand">{status.error}</p>}

        <section className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Monthly watch time" subtitle="Hours streamed each month" />
            <WatchTrend data={trend} />
          </div>
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Most watched on Netflix" subtitle="Titles that keep playing" />
            <TopTitles items={topTitles} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Genres you return to" subtitle="Share of time spent per genre" />
            <GenreChart data={genreStats} />
          </div>
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Where you press play" subtitle="Screens ranked by time" />
            <DeviceChart data={deviceStats} />
            <div className="mt-4 space-y-2 text-sm text-brandMuted">
              {deviceStats.length ? (
                deviceStats.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <span>{device.device}</span>
                    <span className="text-white">{formatHours(device.minutes)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brandMuted">Devices appear once viewing data is ready.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
          <SectionHeader title="Weekly rhythm" subtitle="Day and time windows with the most play" />
          <Heatmap data={heatmapData} />
        </section>

        <section className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
          <SectionHeader title="Watch cadence breakdown" subtitle="Histogram readouts with smoothed trendline" />
          <div className="grid gap-6">
            <ViewingDistributionChart
              title="Daily cadence"
              xLabel="Day of month"
              color="#E50914"
              lineColor="#F67C7C"
              data={dayDistribution}
            />
            <ViewingDistributionChart
              title="Hourly pulse"
              xLabel="Hour of day"
              color="#B20710"
              lineColor="#FF9E9E"
              data={hourDistribution}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Day-of-week leaders" subtitle="A quick glance at the most active days" />
            {dayTotals.length ? (
              <div className="grid gap-3">
                {dayTotals.map((item) => (
                  <div key={item.day} className="flex items-center justify-between rounded-2xl border border-white/5 bg-panel/60 px-4 py-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock3 size={16} className="text-brand" />
                      <span>{item.day}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{formatHours(item.minutes)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brandMuted">Upload viewing data to surface day-level pacing.</p>
            )}
          </div>
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Personalized takeaways" subtitle="Generated from your unique habits" />
            <InsightList items={insights} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Search intensity" subtitle="Queries per month" />
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
          <div className="rounded-[28px] border border-white/5 bg-panel/80 p-6 shadow-panel">
            <SectionHeader title="Most used keywords" subtitle="Pulled from your SearchHistory.csv" />
            <WordCloud tokens={searchStats.wordCloud} />
          </div>
        </section>

        <footer className="text-center text-xs text-brandMuted">
          Netflix Review • Built with React, Vite, Tailwind, Recharts, and Framer Motion.
        </footer>
      </div>
    </div>
    </>
  )
}

export default App
