'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { TOOL_CATEGORIES, PRICE_TYPES } from '@/types'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

export default function ToolFilter() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') ?? ''
  const currentPrice    = searchParams.get('price')    ?? ''

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)

      // 'all' is used when the user clears a filter (value === '')
      window.posthog?.capture('category_filtered', {
        filter_type:  key as 'category' | 'price',
        filter_value: value || 'all',
      })
      window.posthog?.capture('tools_filter_change', {
        filter_type: key as 'category' | 'price',
        value:       value || 'all',
      })
    },
    [router, pathname, searchParams],
  )

  // Active / inactive pill classes per spec
  const active   = 'bg-[#0D0D0D] text-[#F0EDE6] border-[#0D0D0D]'
  const inactive = 'bg-transparent text-[#0D0D0D] border-black/20 hover:border-black/60'
  const pill     = 'pill border text-sm sm:text-xs transition-colors whitespace-nowrap min-h-[44px]'

  return (
    <div className="flex flex-col gap-3">

      {/* ── Category row ───────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-sm sm:text-xs font-medium text-muted uppercase tracking-wide w-16 shrink-0">
          Category
        </span>
        {/* Horizontally scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button onClick={() => update('category', '')} className={`${pill} ${!currentCategory ? active : inactive}`}>
            All
          </button>
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => update('category', currentCategory === cat ? '' : cat)}
              className={`${pill} ${currentCategory === cat ? active : inactive}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Price row ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-sm sm:text-xs font-medium text-muted uppercase tracking-wide w-16 shrink-0">
          Price
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button onClick={() => update('price', '')} className={`${pill} ${!currentPrice ? active : inactive}`}>
            All
          </button>
          {PRICE_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => update('price', currentPrice === value ? '' : value)}
              className={`${pill} ${currentPrice === value ? active : inactive}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
