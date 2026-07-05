'use client'

import { useState, useEffect } from 'react'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

interface Props {
  // Placeholder prop for the future search implementation. Cannot be passed
  // from a server component today (functions aren't serialisable across the
  // server/client boundary) — it will be wired up when the tools page gains
  // client-side filtering.
  onSearch?: (query: string) => void
}

export default function ToolSearch({ onSearch }: Props) {
  const [query, setQuery] = useState('')

  // Debounced search_query event — fires 500 ms after the user stops typing,
  // only when the query is at least 2 characters long.
  useEffect(() => {
    if (query.length < 2) return

    const timer = setTimeout(() => {
      window.posthog?.capture('search_query', {
        query,
        results_count: 0, // placeholder — update when search filtering is implemented
      })
      onSearch?.(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-.691 3.516 2.838 2.837a.5.5 0 0 1-.707.707L8.602 9.723A4.5 4.5 0 1 1 9.31 9.016Z"
          fill="currentColor"
        />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tools…"
        aria-label="Search tools"
        className="w-full min-h-[44px] rounded-full border border-[rgba(13,13,13,0.15)] bg-transparent py-2 pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20 transition-shadow"
      />
    </div>
  )
}
