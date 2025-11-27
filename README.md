# Netflix Review Dashboard

Netflix Review is a Vite + React experience that turns your downloaded Netflix data (ViewingActivity.csv and optional SearchHistory.csv) into a cinematic, insight-driven dashboard. Upload your files to reveal binge rhythms, genre cravings, device habits, search intent, and personalized insights now rendered in a Netflix-inspired dark theme.

## Features

- **Data import & cleanup** - drag-and-drop uploader accepts Netflix exports, cleans empty rows, and validates datasets. Sample data is bundled for quick demos.
- **Watch history intelligence** - total sessions, total hours, peak day/hour, favorite title, monthly watch trend, and per-day pacing cards.
- **Genre analytics** - animated horizontal bar chart highlighting most-watched genres and time spent per genre.
- **Time analysis** - responsive heatmap showing watch intensity across days and 3-hour windows; quick day cards summarize which days dominate.
- **Device insights** - donut chart plus detail list showing time spent per device and most-used screen.
- **Search behavior** - monthly search line chart, key metrics, and a dynamic word cloud (requires SearchHistory.csv).
- **Personalized insights** - auto-generated cards (weekend bingeing, genre crushes, device preference, session pace, search habits).
- **Modern UI** - Tailwind-styled Netflix-grade surfaces, Work Sans typography (Graphik-inspired), and Framer Motion flourishes.
- **Brand-aligned palette** - Custom red/ink token set, NR favicon, and copy updates that echo Netflix while avoiding trademarked assets.

## Tech Stack

- React 19 (TypeScript) + Vite (Rolldown)
- Tailwind CSS 3.4 + custom Netflix theming
- Recharts for data visualizations
- Framer Motion for animated entrances
- PapaParse + date-fns for CSV parsing and date transforms
- Lucide icons & custom word cloud component

## Getting Started

```bash
npm install
npm run dev
```

Open the dev server link (usually `http://localhost:5173`) to interact with the dashboard. Hot Module Reloading is enabled by default.

### Build for production

```bash
npm run build
npm run preview
```

## Preparing Your Data

1. Visit <https://www.netflix.com/account/getmyinfo> and request your data export.
2. After Netflix emails the archive, unzip it locally.
3. Locate `ViewingActivity.csv` (required) and `SearchHistory.csv` (optional but recommended).
4. Drag the files into the uploader or click to browse.
5. The dashboard cleans and parses entries instantly; insights and charts refresh automatically.

> Tip: Use the **“Load sample dataset”** button to explore the UI without waiting for Netflix to send your export.

## Project Structure (high level)

```
src/
  components/          # Upload panel, charts, insights, cards, heatmap, word cloud
  utils/analytics.ts   # Parsing, aggregation, and insight helpers
  types.ts             # Shared TypeScript models
  App.tsx              # Main experience shell
```

## Notes

- Genre detection relies on curated keyword matching because Netflix’s export does not include explicit genres.
- The Search section stays empty until SearchHistory.csv is provided; other sections work with ViewingActivity.csv alone.
- All UI copy and insights are generated locally - no external APIs are called.
- The refreshed visual system mirrors Netflix’s palette using Work Sans as a Graphik-style alternative and a custom NR favicon, so no trademarked assets are bundled.

## System Overview & Requirements

### 1. Introduction

**1.1 System Purpose** – Provide Netflix subscribers with an interactive, privacy-friendly dashboard that converts their official CSV exports into digestible insights about viewing rhythms, preferred titles, and search intent.

**1.2 System Scope** – The current build parses `ViewingActivity.csv` (required) and `SearchHistory.csv` (optional) entirely in the browser, performs cleaning and aggregation in `src/utils/analytics.ts`, and renders charts plus insight cards through the React UI. No server-side processing or external APIs are involved.

**1.3 Reports & Analytics** – Total hours, total sessions, peak day/hour window, top titles, genre distribution, device usage, monthly watch trend, heatmap of day/hour intensity, daily and hourly histograms, search trend metrics, keyword word cloud, and AI-lite insight blurbs.

### 2. System Overview

**2.1 System Context** – User uploads CSV files → PapaParse ingests and cleans rows in the browser → TypeScript helpers summarize metrics → Recharts, custom components, and Tailwind styles visualize data within the SPA. Sample datasets in `public/` let visitors preview without personal data.

**2.2 System Functions** – Accept drag-and-drop uploads, validate/clean datasets, compute stats, render responsive graphs/cards, surface natural-language takeaways, and expose a CTA for getting a fresh Netflix export.

**2.3 User Characteristics** – Non-technical Netflix subscribers using desktop browsers. Only basic file handling knowledge is assumed.

### 3. Definitions

CSV: Comma-separated values. EDA: Exploratory data analysis. UI: User interface. Dashboard: This React single-page experience.

### 4. Requirements

**4.1 External Interfaces** – Modern Chromium/Firefox/Safari browser, local filesystem for CSV import, React component surface for visualization.

**4.2 Hardware Interface** – Laptop/desktop with internet for initial load; analytics run offline after files are loaded.

**4.3 System Interface** – Frontend: React 19 + Vite + TypeScript. Data layer: PapaParse, date-fns, custom analytics helpers. Visualization: Recharts, custom word cloud, Tailwind CSS. Deployment: Static build optimized for Vercel (or any static host).

**4.4 User Interface** – Upload panel with status chips, Netflix-styled dashboard sections (metrics, watch trend, genres, devices, heatmap, distributions, search, word cloud, insights), sample-data button, and footer attribution.

### 5. Performance Requirements

Client-side parsing keeps personal data local; typical exports under 10k rows parse and render in ≈3–5 seconds on modern laptops. Charts animate at 60 fps thanks to lightweight datasets and memoized selectors.

### 6. Design Constraints

- Depends on Netflix export column names (`Start Time`, `Title`, `Duration`, `Search`, etc.).
- Entire workload runs in-browser, so memory/CPU budgets follow user hardware limits.
- Internet access is only needed to download the SPA or to fetch sample datasets/intro video.

### 7. Functions

Upload data → sanitize timestamps/durations → bucket metrics (titles, genres, devices, day/hour) → build trend/heatmap/search datasets → render dashboard → provide personalized insight cards.

### 8. Functional Requirements

- Accept and validate Netflix CSV files via drag-and-drop or file picker.
- Normalize timestamps, durations, titles, and devices before computation.
- Compute watch-time analytics (totals, peaks, titles, genres, devices, temporal distributions).
- Display bar, line, donut, heatmap, and word-cloud visualizations with responsive layouts.

### 9. Non-Functional Requirements

- **Usability** – Clear upload states, Netflix-inspired theming, responsive layout.
- **Reliability** – Parsing errors reported in-line; memoized stats prevent inconsistent reads.
- **Performance** – Minimal re-rendering via `useMemo`; charts fed only when data changes.
- **Security/Privacy** – Files never leave the browser; no network calls after initial page load.

### 10. Use Case & Flow

User opens dashboard → loads sample data or uploads personal CSVs → client cleans and aggregates data → analytics feed visual components → user reviews insights/download guidance. The linear flow mirrors `User → Uploads Data → On-device Processing → Analytics Engine (TypeScript helpers) → Dashboard Output`.

Enjoy exploring your Netflix story!
