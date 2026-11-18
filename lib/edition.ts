// The Signal: one edition a day, 7 stories, landing at 8:00 IST.
// Pure helpers, safe on the server and the client.
import type { NewsArticle } from '@/types'

/** 8:00 IST = 02:30 UTC. */
const EDITION_UTC_HOUR = 2
const EDITION_UTC_MINUTE = 30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/** Free readers get the last 7 days of editions. Pro opens the full archive. */
export const FREE_ARCHIVE_DAYS = 7

// Each market's timezone and its short name, for "lands at 9:30 WIB".
const MARKET_TZ: Record<string, { zone: string; abbr: string }> = {
  in: { zone: 'Asia/Kolkata', abbr: 'IST' },
  id: { zone: 'Asia/Jakarta', abbr: 'WIB' },
  vn: { zone: 'Asia/Ho_Chi_Minh', abbr: 'ICT' },
  ph: { zone: 'Asia/Manila', abbr: 'PHT' },
  th: { zone: 'Asia/Bangkok', abbr: 'ICT' },
  my: { zone: 'Asia/Kuala_Lumpur', abbr: 'MYT' },
  sg: { zone: 'Asia/Singapore', abbr: 'SGT' },
}

/** Today's date in India (YYYY-MM-DD). Editions are dated in IST. */
export function todayIST(now: Date = new Date()): string {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10)
}

/** Shift a YYYY-MM-DD date by whole days. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** True when the edition date is inside the free window (today and the 6 days before it). */
export function isFreeEdition(date: string, today: string = todayIST()): boolean {
  return date > addDays(today, -FREE_ARCHIVE_DAYS)
}

/** "Mon 16 Nov 2026" (withYear) or "Mon 16 Nov". */
export function formatEditionDate(date: string, withYear = true): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).replace(',', '')
}

/** When 8:00 IST lands in the market's own timezone: { time: '9:30', tz: 'WIB' }. */
export function editionTimeFor(marketId: string): { time: string; tz: string } {
  const market = MARKET_TZ[marketId] ?? MARKET_TZ.in
  const landing = new Date(Date.UTC(2026, 0, 1, EDITION_UTC_HOUR, EDITION_UTC_MINUTE))
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: market.zone,
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(landing)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '8')
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  return { time: `${hour}:${minute}`, tz: market.abbr }
}

/** Read time from our own summary (excerpt + why it matters) at 200 words a minute, minimum 1. */
export function readMinutes(story: Pick<NewsArticle, 'excerpt' | 'why_it_matters'>): number {
  const words = `${story.excerpt ?? ''} ${story.why_it_matters ?? ''}`.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function totalMinutes(stories: Pick<NewsArticle, 'excerpt' | 'why_it_matters'>[]): number {
  return stories.reduce((sum, s) => sum + readMinutes(s), 0)
}

/** "07" */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export interface EditionSummary<S> {
  date: string
  /** Edition #1 is the first edition ever published. */
  number: number
  stories: S[]
}

/** Groups index rows (newest date first) into editions and numbers them. */
export function groupEditions<S extends { edition_date: string | null }>(rows: S[]): EditionSummary<S>[] {
  const byDate = new Map<string, S[]>()
  for (const row of rows) {
    if (!row.edition_date) continue
    const list = byDate.get(row.edition_date) ?? []
    list.push(row)
    byDate.set(row.edition_date, list)
  }
  const dates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1))
  return dates.map((date, i) => ({ date, number: dates.length - i, stories: byDate.get(date) ?? [] }))
}
