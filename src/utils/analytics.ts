import { format } from 'date-fns'
import type {
  DeviceStat,
  DistributionPoint,
  GenreStat,
  HeatmapPoint,
  Insight,
  RawSearchRow,
  RawViewingRow,
  SearchEntry,
  SearchStats,
  TopTitleStat,
  TrendPoint,
  ViewingActivityEntry,
  WatchHighlights,
} from '../types'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'season',
  'episode',
  'movie',
  'show',
])

const GENRE_KEYWORDS: Record<string, string[]> = {
  'Action & Thriller': ['action', 'mission', 'spy', 'hero', 'battle', 'war', 'thriller', 'heist'],
  'Drama & Romance': ['drama', 'romance', 'love', 'heart', 'wedding', 'affair'],
  Comedy: ['comedy', 'funny', 'laugh', 'sitcom', 'stand-up', 'joke'],
  Documentary: ['documentary', 'docuseries', 'true crime', 'history', 'planet', 'nature'],
  'Kids & Family': ['kids', 'family', 'animated', 'cartoon', 'adventures'],
  Anime: ['anime', 'manga', 'naruto', 'attack on titan', 'demon', 'hero academia'],
  Horror: ['horror', 'ghost', 'haunting', 'zombie', 'haunted'],
  'Sci-Fi & Fantasy': ['sci-fi', 'space', 'galaxy', 'future', 'robot', 'fantasy', 'magic'],
}

const buildId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2))

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')

const parseDurationToMinutes = (value = '') => {
  if (!value) return 0
  const parts = value.split(':').map((part) => Number(part) || 0)
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts
    return hours * 60 + minutes + Math.round(seconds / 60)
  }
  if (parts.length === 2) {
    const [hours, minutes] = parts
    return hours * 60 + minutes
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const inferGenre = (title: string, attributes: string) => {
  const haystack = `${title} ${attributes}`.toLowerCase()
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return genre
    }
  }
  if (haystack.includes('season') || haystack.includes('episode')) {
    return 'Series'
  }
  if (haystack.includes('documentary')) {
    return 'Documentary'
  }
  return 'General Entertainment'
}

const toHourRange = (hour: number) => {
  const start = hour % 24
  const end = (hour + 3) % 24
  const formatHour = (value: number) => {
    const period = value >= 12 ? 'PM' : 'AM'
    const normalized = value % 12 || 12
    return `${normalized}${period}`
  }
  return `${formatHour(start)} - ${formatHour(end)}`
}

const smoothSeries = (values: number[], window = 5) => {
  const smoothed: number[] = []
  for (let index = 0; index < values.length; index += 1) {
    let sum = 0
    let count = 0
    for (let offset = -Math.floor(window / 2); offset <= Math.floor(window / 2); offset += 1) {
      const neighborIndex = index + offset
      if (neighborIndex >= 0 && neighborIndex < values.length) {
        sum += values[neighborIndex]
        count += 1
      }
    }
    smoothed.push(count ? Number((sum / count).toFixed(1)) : 0)
  }
  return smoothed
}

export const parseViewingRows = (rows: RawViewingRow[]): ViewingActivityEntry[] =>
  rows
    .map((row) => {
      const startTimeRaw = row['Start Time']?.trim()
      if (!startTimeRaw) return null
      const startTime = new Date(startTimeRaw)
      if (Number.isNaN(startTime.getTime())) return null
      const durationMinutes = parseDurationToMinutes(row.Duration)
      if (!durationMinutes) return null
      const title = row.Title?.trim() || 'Untitled'
      const attributes = row.Attributes || row['Supplemental Video Type'] || ''
      const genre = inferGenre(title, attributes)
      const device = row['Device Type']?.trim() || 'Unknown Device'
      const dayName = DAY_LABELS[startTime.getDay()]
      const hour = startTime.getHours()

      return {
        id: buildId(),
        profileName: row['Profile Name']?.trim() || 'Profile',
        title,
        normalizedTitle: normalize(title),
        genre,
        startTime,
        durationMinutes,
        device,
        country: row.Country?.trim() || 'Unknown',
        supplementalVideoType: row['Supplemental Video Type']?.trim() || 'Title',
        attributes,
        dayName,
        hour,
      }
    })
    .filter((row): row is ViewingActivityEntry => Boolean(row))

export const parseSearchRows = (rows: RawSearchRow[]): SearchEntry[] =>
  rows
    .map((row) => {
      const timestampRaw = row.Timestamp || row.Time || row.Date
      if (!timestampRaw) return null
      const timestamp = new Date(timestampRaw)
      if (Number.isNaN(timestamp.getTime())) return null
      const query =
        row.VideoTitle ||
        row.Search ||
        row['Search Term'] ||
        row.Query ||
        row['Query'] ||
        row['Search'] ||
        row.ProfileName ||
        'Search'
      const cleaned = query.trim()
      if (!cleaned) return null
      return {
        id: buildId(),
        profileName: row.ProfileName?.trim() || row['Profile Name']?.trim() || 'Profile',
        query: cleaned,
        timestamp,
      }
    })
    .filter((row): row is SearchEntry => Boolean(row))

export const summarizeWatching = (entries: ViewingActivityEntry[]): WatchHighlights => {
  if (!entries.length) {
    return {
      totalTitles: 0,
      totalHours: 0,
      totalSessions: 0,
      averageSessionMinutes: 0,
      peakDay: 'N/A',
      peakHourRange: 'N/A',
    }
  }

  const totalMinutes = entries.reduce((sum, item) => sum + item.durationMinutes, 0)
  const totalSessions = entries.length
  const titleFrequency = new Map<string, { minutes: number; title: string }>()
  const dayMinutes = new Map<string, number>()
  const hourMinutes = new Map<number, number>()

  entries.forEach((item) => {
    const frequency = titleFrequency.get(item.normalizedTitle) || { minutes: 0, title: item.title }
    frequency.minutes += item.durationMinutes
    frequency.title = item.title
    titleFrequency.set(item.normalizedTitle, frequency)
    dayMinutes.set(item.dayName, (dayMinutes.get(item.dayName) || 0) + item.durationMinutes)
    hourMinutes.set(item.hour, (hourMinutes.get(item.hour) || 0) + item.durationMinutes)
  })

  const uniqueTitles = titleFrequency.size
  const topEntry = [...titleFrequency.values()].sort((a, b) => b.minutes - a.minutes)[0]
  const peakDay = [...dayMinutes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
  const peakHour = [...hourMinutes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 0

  return {
    totalTitles: uniqueTitles,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    totalSessions,
    averageSessionMinutes: Number((totalMinutes / totalSessions).toFixed(0)),
    peakDay,
    peakHourRange: toHourRange(peakHour),
    topTitle: topEntry
      ? {
          value: topEntry.title,
          count: Number((topEntry.minutes / 60).toFixed(1)),
        }
      : undefined,
  }
}

export const buildTrend = (entries: ViewingActivityEntry[]): TrendPoint[] => {
  const byMonth = new Map<string, { label: string; minutes: number }>()
  entries.forEach((item) => {
    const key = format(item.startTime, 'yyyy-MM')
    const bucket = byMonth.get(key) || { label: format(item.startTime, 'MMM yyyy'), minutes: 0 }
    bucket.minutes += item.durationMinutes
    byMonth.set(key, bucket)
  })
  return [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => ({ label: value.label, minutes: value.minutes }))
}

export const buildGenreStats = (entries: ViewingActivityEntry[]): GenreStat[] => {
  const byGenre = new Map<string, GenreStat>()
  entries.forEach((item) => {
    const existing = byGenre.get(item.genre) || { genre: item.genre, entries: 0, minutes: 0 }
    existing.entries += 1
    existing.minutes += item.durationMinutes
    byGenre.set(item.genre, existing)
  })
  return [...byGenre.values()].sort((a, b) => b.minutes - a.minutes)
}

export const buildDeviceStats = (entries: ViewingActivityEntry[]): DeviceStat[] => {
  const byDevice = new Map<string, DeviceStat>()
  entries.forEach((item) => {
    const key = item.device || 'Device'
    const existing = byDevice.get(key) || { device: key, count: 0, minutes: 0 }
    existing.count += 1
    existing.minutes += item.durationMinutes
    byDevice.set(key, existing)
  })
  return [...byDevice.values()].sort((a, b) => b.minutes - a.minutes)
}

export const buildTopTitles = (entries: ViewingActivityEntry[], limit = 6): TopTitleStat[] => {
  const map = new Map<string, TopTitleStat>()
  entries.forEach((item) => {
    const existing = map.get(item.normalizedTitle) || {
      title: item.title,
      minutes: 0,
      sessions: 0,
      genre: item.genre,
    }
    existing.minutes += item.durationMinutes
    existing.sessions += 1
    map.set(item.normalizedTitle, existing)
  })
  return [...map.values()].sort((a, b) => b.minutes - a.minutes).slice(0, limit)
}

export const buildHeatmap = (entries: ViewingActivityEntry[]): HeatmapPoint[] => {
  const grid = new Map<string, number>()
  entries.forEach((item) => {
    const key = `${item.dayName}-${item.hour}`
    grid.set(key, (grid.get(key) || 0) + item.durationMinutes)
  })
  return [...grid.entries()].map(([key, value]) => {
    const [day, hour] = key.split('-')
    return { day, hour: Number(hour), value }
  })
}

export const buildSearchStats = (entries: SearchEntry[]): SearchStats => {
  if (!entries.length) {
    return { totalQueries: 0, monthlyCounts: [], wordCloud: [], topSearches: [] }
  }
  const monthly = new Map<string, number>()
  const tokenCounts = new Map<string, number>()
  const queryCounts = new Map<string, number>()

  entries.forEach((item) => {
    const key = format(item.timestamp, 'yyyy-MM')
    monthly.set(key, (monthly.get(key) || 0) + 1)
    const base = normalize(item.query)
    queryCounts.set(base, (queryCounts.get(base) || 0) + 1)
    base
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word && !STOP_WORDS.has(word))
      .forEach((word) => {
        tokenCounts.set(word, (tokenCounts.get(word) || 0) + 1)
      })
  })

  const monthlyCounts = [...monthly.entries()]
    .map(([key, value]) => ({ key, label: format(new Date(`${key}-01`), 'MMM yyyy'), minutes: value }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, minutes }) => ({ label, minutes }))
  const wordCloud = [...tokenCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 60)

  const topSearches = [...queryCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return { totalQueries: entries.length, monthlyCounts, wordCloud, topSearches }
}

const buildDistribution = (values: number[], labels: string[]): DistributionPoint[] => {
  const smoothed = smoothSeries(values)
  return labels.map((label, index) => ({ label, value: values[index], smooth: smoothed[index] }))
}

export const buildDayDistribution = (entries: ViewingActivityEntry[]): DistributionPoint[] => {
  if (!entries.length) return []
  const byDay = new Map<number, number>()
  entries.forEach((entry) => {
    const day = entry.startTime.getDate()
    byDay.set(day, (byDay.get(day) || 0) + entry.durationMinutes)
  })
  const labels: string[] = []
  const values: number[] = []
  for (let day = 1; day <= 31; day += 1) {
    labels.push(day.toString())
    values.push(byDay.get(day) || 0)
  }
  return buildDistribution(values, labels)
}

export const buildHourDistribution = (entries: ViewingActivityEntry[]): DistributionPoint[] => {
  if (!entries.length) return []
  const byHour = new Map<number, number>()
  entries.forEach((entry) => {
    byHour.set(entry.hour, (byHour.get(entry.hour) || 0) + entry.durationMinutes)
  })
  const labels: string[] = []
  const values: number[] = []
  for (let hour = 0; hour < 24; hour += 1) {
    labels.push(hour.toString())
    values.push(byHour.get(hour) || 0)
  }
  return buildDistribution(values, labels)
}

export const createInsights = (
  watch: WatchHighlights,
  genres: GenreStat[],
  devices: DeviceStat[],
  heatmap: HeatmapPoint[],
  search: SearchStats,
): Insight[] => {
  const insights: Insight[] = []
  const weekendMinutes = heatmap
    .filter((point) => point.day === 'Saturday' || point.day === 'Sunday')
    .reduce((sum, item) => sum + item.value, 0)
  const weekdayMinutes = heatmap.reduce((sum, item) => sum + item.value, 0) - weekendMinutes

  if (heatmap.length && weekendMinutes > weekdayMinutes) {
    insights.push({
      label: 'Weekend Binges',
      detail: 'You log more minutes on Saturdays & Sundays.',
      highlight: 'Weekends dominate your screen time.',
    })
  } else {
    insights.push({
      label: 'Weekday Viewer',
      detail: 'Your sessions are steady through the work week.',
      highlight: 'Weekday consistency keeps watch time balanced.',
    })
  }

  if (genres.length) {
    const [favorite, runnerUp] = genres
    insights.push({
      label: 'Genre Crush',
      detail: `You lean towards ${favorite.genre.toLowerCase()} stories.`,
      highlight: runnerUp ? `${favorite.genre} & ${runnerUp.genre} lead the queue.` : favorite.genre,
    })
  }

  if (devices.length) {
    const top = devices[0]
    insights.push({
      label: 'Device of Choice',
      detail: `Most sessions start on your ${top.device}.`,
      highlight: `${Math.round((top.minutes / (watch.totalHours * 60 || 1)) * 100)}% of watch time`,
    })
  }

  if (watch.averageSessionMinutes) {
    insights.push({
      label: 'Session Pace',
      detail: `Average session runs about ${watch.averageSessionMinutes} minutes.`,
      highlight: 'Short bursts keep things fresh.',
    })
  }

  if (search.totalQueries) {
    const favorite = search.topSearches[0]
    insights.push({
      label: 'Search Habit',
      detail: favorite ? `You frequently looked up "${favorite.value}".` : 'Searches guide what you play next.',
      highlight: `${search.totalQueries} searches logged`,
    })
  }

  return insights
}
