'use client'

// Command search (⌘K or "/") is mounted once in the root layout. Anything can
// open it by calling openSearch(), e.g. the nav search bar or the 404 page.

export const OPEN_SEARCH_EVENT = 'bohemo:open-search'
const RECENT_KEY = 'bohemo:recent-searches'
const MAX_RECENT = 5

export function openSearch(query = '') {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail: { query } }))
}

/** Recent searches stay on this device only. */
export function readRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

export function writeRecentSearches(list: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch {
    // localStorage unavailable: recent searches just don't persist
  }
}

export function addRecentSearch(list: string[], query: string): string[] {
  const q = query.trim()
  if (!q) return list
  return [q, ...list.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT)
}
