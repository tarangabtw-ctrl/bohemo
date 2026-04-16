'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { TOOL_CATEGORIES, PRICE_TYPES } from '@/types'

export default function ToolFilter() {
  const router      = useRouter()
  const pathname    = usePathname()
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
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide w-16 shrink-0">
          Category
        </span>
        <button
          onClick={() => update('category', '')}
          className={`pill border text-xs transition-colors ${
            !currentCategory
              ? 'bg-ink text-cream border-ink'
              : 'bg-transparent text-secondary border-[rgba(13,13,13,0.15)] hover:bg-cream-dark'
          }`}
        >
          All
        </button>
        {TOOL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => update('category', currentCategory === cat ? '' : cat)}
            className={`pill border text-xs transition-colors ${
              currentCategory === cat
                ? 'bg-ink text-cream border-ink'
                : 'bg-transparent text-secondary border-[rgba(13,13,13,0.15)] hover:bg-cream-dark'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide w-16 shrink-0">
          Price
        </span>
        <button
          onClick={() => update('price', '')}
          className={`pill border text-xs transition-colors ${
            !currentPrice
              ? 'bg-ink text-cream border-ink'
              : 'bg-transparent text-secondary border-[rgba(13,13,13,0.15)] hover:bg-cream-dark'
          }`}
        >
          All
        </button>
        {PRICE_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => update('price', currentPrice === value ? '' : value)}
            className={`pill border text-xs transition-colors ${
              currentPrice === value
                ? 'bg-ink text-cream border-ink'
                : 'bg-transparent text-secondary border-[rgba(13,13,13,0.15)] hover:bg-cream-dark'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
