export interface RawViewingRow {
  [key: string]: string | undefined
  'Profile Name'?: string
  'Start Time'?: string
  Duration?: string
  Title?: string
  Country?: string
  'Supplemental Video Type'?: string
  'Device Type'?: string
  'Device Model'?: string
  Attributes?: string
}

export interface RawSearchRow {
  [key: string]: string | undefined
  ProfileName?: string
  'Profile Name'?: string
  VideoTitle?: string
  Search?: string
  Query?: string
  Timestamp?: string
  Date?: string
  Time?: string
}

export interface ViewingActivityEntry {
  id: string
  profileName: string
  title: string
  normalizedTitle: string
  genre: string
  startTime: Date
  durationMinutes: number
  device: string
  country: string
  supplementalVideoType: string
  attributes: string
  dayName: string
  hour: number
}

export interface SearchEntry {
  id: string
  profileName: string
  query: string
  timestamp: Date
}

export interface WordCloudToken {
  value: string
  count: number
}

export interface DeviceStat {
  device: string
  count: number
  minutes: number
}

export interface GenreStat {
  genre: string
  entries: number
  minutes: number
}

export interface TopTitleStat {
  title: string
  minutes: number
  sessions: number
  genre: string
}

export interface TrendPoint {
  label: string
  minutes: number
}

export interface HeatmapPoint {
  day: string
  hour: number
  value: number
}

export interface DistributionPoint {
  label: string
  value: number
  smooth: number
}

export interface SearchStats {
  totalQueries: number
  monthlyCounts: TrendPoint[]
  wordCloud: WordCloudToken[]
  topSearches: WordCloudToken[]
}

export interface WatchHighlights {
  totalTitles: number
  totalHours: number
  totalSessions: number
  averageSessionMinutes: number
  peakDay: string
  peakHourRange: string
  topTitle?: WordCloudToken
}

export interface Insight {
  label: string
  detail: string
  highlight: string
}
