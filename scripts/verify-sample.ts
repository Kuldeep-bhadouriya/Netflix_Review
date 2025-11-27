import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import Papa from 'papaparse'

import { parseViewingRows, summarizeWatching } from '../src/utils/analytics'
import type { RawViewingRow } from '../src/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const csvPath = resolve(__dirname, '../public/sample-viewing-activity.csv')
const csv = readFileSync(csvPath, 'utf8')

const { data } = Papa.parse<RawViewingRow>(csv, {
  header: true,
  skipEmptyLines: true,
})

const parsed = parseViewingRows(data)

if (!parsed.length) {
  throw new Error('Sample viewing file did not produce any entries. Uploading a single file would fail in this case.')
}

const summary = summarizeWatching(parsed)

console.log(
  JSON.stringify(
    {
      rowsParsed: parsed.length,
      totalHours: summary.totalHours,
      peakDay: summary.peakDay,
    },
    null,
    2,
  ),
)
