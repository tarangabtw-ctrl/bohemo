'use client'

import { useCallback, useEffect, useState } from 'react'
import { track } from '@/lib/analytics'

const SAVED_KEY = 'bohemo:saved-tools'
const COMPARE_KEY = 'bohemo:compare-tools'
const SAVED_STORIES_KEY = 'bohemo:saved-stories'
const READ_STORIES_KEY = 'bohemo:read-stories'
// Read marks only matter for the last week of editions; keep the list short.
const MAX_READ = 200
const MAX_COMPARE = 3
// Fired on window after every write, so every component using these hooks on
// the page (e.g. the tool page's action card and its Alternatives) stays in sync.
const CHANGE_EVENT = 'bohemo:list-change'

function readList(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeList(key: string, list: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // localStorage unavailable — the in-memory state still works for this session
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key, list } }))
}

/** A string list in localStorage, shared by every hook instance on the page and across tabs. */
function useStoredList(key: string) {
  const [list, setList] = useState<string[]>([])

  useEffect(() => {
    setList(readList(key))
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ key: string; list: string[] }>).detail
      if (detail?.key === key) setList(detail.list)
    }
    function onStorage(e: StorageEvent) {
      if (e.key === key) setList(readList(key))
    }
    window.addEventListener(CHANGE_EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  const write = useCallback((next: string[]) => writeList(key, next), [key])
  return [list, write] as const
}

/** Saved tool slugs, persisted across pages. SPEC: "build it for real" with localStorage. */
export function useSavedTools() {
  const [saved, write] = useStoredList(SAVED_KEY)

  const toggle = useCallback(
    (slug: string) => {
      if (saved.includes(slug)) return write(saved.filter((s) => s !== slug))
      track('tool_saved', { slug, saves: saved.length + 1 })
      write([...saved, slug])
    },
    [saved, write],
  )

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved])

  return { saved, isSaved, toggle }
}

/** Compare tray slugs (max 3), persisted across pages. */
export function useCompareTray() {
  const [compare, write] = useStoredList(COMPARE_KEY)

  const toggle = useCallback(
    (slug: string) => {
      if (compare.includes(slug)) write(compare.filter((s) => s !== slug))
      else if (compare.length < MAX_COMPARE) write([...compare, slug])
    },
    [compare, write],
  )

  const remove = useCallback((slug: string) => write(compare.filter((s) => s !== slug)), [compare, write])

  const replace = useCallback((slugs: string[]) => write(slugs.slice(0, MAX_COMPARE)), [write])

  const clear = useCallback(() => write([]), [write])

  return { compare, isComparing: (slug: string) => compare.includes(slug), toggle, remove, replace, clear, max: MAX_COMPARE }
}

/** Saved news story ids, persisted across pages (shown on /saved). */
export function useSavedStories() {
  const [saved, write] = useStoredList(SAVED_STORIES_KEY)

  const toggle = useCallback(
    (id: string) => {
      if (saved.includes(id)) return write(saved.filter((s) => s !== id))
      track('story_saved', { id, saves: saved.length + 1 })
      write([...saved, id])
    },
    [saved, write],
  )

  const isSaved = useCallback((id: string) => saved.includes(id), [saved])

  return { saved, isSaved, toggle }
}

/** Story ids the reader has opened, for "3 of 7 read" in The Signal. */
export function useReadStories() {
  const [read, write] = useStoredList(READ_STORIES_KEY)

  // Reads storage directly: markRead runs on page mount, before this hook's state has loaded.
  const markRead = useCallback(
    (id: string) => {
      const current = readList(READ_STORIES_KEY)
      if (current.includes(id)) return
      write([...current, id].slice(-MAX_READ))
    },
    [write],
  )

  const isRead = useCallback((id: string) => read.includes(id), [read])

  return { read, isRead, markRead }
}
