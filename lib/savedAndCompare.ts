'use client'

import { useCallback, useEffect, useState } from 'react'

const SAVED_KEY = 'bohemo:saved-tools'
const COMPARE_KEY = 'bohemo:compare-tools'
const MAX_COMPARE = 3

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
}

/** Saved tool slugs, persisted across pages. SPEC: "build it for real" with localStorage. */
export function useSavedTools() {
  const [saved, setSaved] = useState<string[]>([])
  useEffect(() => setSaved(readList(SAVED_KEY)), [])

  const toggle = useCallback((slug: string) => {
    setSaved((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      writeList(SAVED_KEY, next)
      return next
    })
  }, [])

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved])

  return { saved, isSaved, toggle }
}

/** Compare tray slugs (max 3), persisted across pages. */
export function useCompareTray() {
  const [compare, setCompare] = useState<string[]>([])
  useEffect(() => setCompare(readList(COMPARE_KEY)), [])

  const toggle = useCallback((slug: string) => {
    setCompare((prev) => {
      if (prev.includes(slug)) {
        const next = prev.filter((s) => s !== slug)
        writeList(COMPARE_KEY, next)
        return next
      }
      if (prev.length >= MAX_COMPARE) return prev
      const next = [...prev, slug]
      writeList(COMPARE_KEY, next)
      return next
    })
  }, [])

  const remove = useCallback((slug: string) => {
    setCompare((prev) => {
      const next = prev.filter((s) => s !== slug)
      writeList(COMPARE_KEY, next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setCompare([])
    writeList(COMPARE_KEY, [])
  }, [])

  return { compare, isComparing: (slug: string) => compare.includes(slug), toggle, remove, clear, max: MAX_COMPARE }
}
