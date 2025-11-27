# Netflix Review Dashboard

Netflix Review is a Vite + React experience that turns your downloaded Netflix data (ViewingActivity.csv and optional SearchHistory.csv) into a cinematic, insight-driven dashboard. Upload your files to reveal binge rhythms, genre cravings, device habits, search intent, and personalized insights paired with vibrant charts and subtle motion.

## Features

- **Data import & cleanup** - drag-and-drop uploader accepts Netflix exports, cleans empty rows, and validates datasets. Sample data is bundled for quick demos.
- **Watch history intelligence** - total sessions, total hours, peak day/hour, favorite title, monthly watch trend, and per-day pacing cards.
- **Genre analytics** - animated horizontal bar chart highlighting most-watched genres and time spent per genre.
- **Time analysis** - responsive heatmap showing watch intensity across days and 3-hour windows; quick day cards summarize which days dominate.
- **Device insights** - donut chart plus detail list showing time spent per device and most-used screen.
- **Search behavior** - monthly search line chart, key metrics, and a dynamic word cloud (requires SearchHistory.csv).
- **Personalized insights** - auto-generated cards (weekend bingeing, genre crushes, device preference, session pace, search habits).
- **Modern UI** - Tailwind-styled glassmorphism, custom gradient mesh background, and framer-motion for subtle transitions.

## Tech Stack

- React 19 (TypeScript) + Vite (Rolldown)
- Tailwind CSS 3.4 + custom theming
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

Enjoy exploring your Netflix story!
