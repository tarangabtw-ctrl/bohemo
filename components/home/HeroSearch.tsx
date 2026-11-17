'use client'

import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { useMarket } from '../MarketProvider'
import { Icon } from '../Icon'
import { Button } from '../Button'
import { FilterChip } from '../FilterChip'
import { LocalFitMeter } from '../LocalFitMeter'
import { VerifiedBadge } from '../VerifiedBadge'

interface HeroSearchProps {
  tools: Tool[]
}

function searchTools(tools: Tool[], query: string, marketId: string, marketName: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const matches = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  )
  return matches
    .map((tool) => ({ tool, fit: computeLocalFit(tool, marketId, marketName) }))
    .sort((a, b) => b.fit.confirmed - a.fit.confirmed)
    .slice(0, 3)
}

export function HeroSearch({ tools }: HeroSearchProps) {
  const { market, resolved } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  const [query, setQuery] = useState('')
  const inputId = useId()

  const results = useMemo(() => searchTools(tools, query, current.id, current.name), [tools, query, current.id, current.name])
  const chips = useMemo(() => {
    const seen = new Set<string>()
    const picks: string[] = []
    for (const t of tools) {
      if (!seen.has(t.category)) {
        seen.add(t.category)
        picks.push(t.category)
      }
      if (picks.length >= 6) break
    }
    return picks
  }, [tools])

  return (
    <section className="pb-9 pt-10 md:pb-12 md:pt-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        {resolved && (
          <p className="mb-2 text-[13px] text-text-muted">
            <span className="md:hidden">Showing {current.name} · </span>
            <span className="hidden md:inline">Showing tools and prices for {current.name}. </span>
            <span className="font-semibold underline underline-offset-2">Change</span> in the market picker above.
          </p>
        )}
        <p className="font-mono text-label font-medium uppercase tracking-label text-text-muted">AI tools and news</p>
        <h1 className="mt-3 text-display-xl font-extrabold text-text-strong">
          Most AI tools weren&apos;t
          <br />
          built for you. These were.
        </h1>

        <form
          className="mt-8 max-w-[920px] md:mt-9"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor={inputId} className="mb-3 block font-display text-lg font-bold tracking-title text-text-strong md:text-xl">
            What do you need AI to do?
          </label>
          <div className="flex items-center gap-3 rounded-pill border-thick border-ink-900 bg-surface-raised py-2 pl-5 pr-2 focus-within:outline focus-within:outline-thick focus-within:outline-focus-ring focus-within:outline-offset-[3px] md:h-[68px] md:py-0">
            <Icon name="search" size={20} className="shrink-0 text-ink-600" />
            <input
              id={inputId}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              placeholder="Search by task, category or tag"
              className="h-11 min-w-0 flex-1 bg-transparent font-body text-base text-text-strong outline-none placeholder:text-ink-600 md:h-full md:text-lg"
            />
            <Button type="submit" icon="arrow-right" label="Find tools" className="md:hidden" />
            <Button type="submit" size="lg" iconRight="arrow-right" className="hidden md:inline-flex">
              Find tools
            </Button>
          </div>
        </form>

        {chips.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((c) => (
              <FilterChip key={c} selected={query.toLowerCase() === c.toLowerCase()} onClick={() => setQuery(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
        )}

        <div className="mt-7 max-w-[920px]" aria-live="polite">
          {query.trim() && results.length > 0 && (
            <>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="font-display text-lg font-bold tracking-title text-text-strong">Top {results.length} for &ldquo;{query}&rdquo;</p>
              </div>
              <ol className="grid gap-2.5">
                {results.map(({ tool, fit }, i) => (
                  <li key={tool.id} className="flex items-center gap-2.5">
                    <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-ink-900 font-mono text-base font-semibold text-cream-200">
                      {i + 1}
                    </span>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="flex min-h-[76px] flex-1 items-center gap-4 rounded-pill border-hairline border-border-hairline bg-surface-raised px-4 py-3 text-inherit no-underline transition-colors duration-fast hover:border-ink-900"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-inset font-display font-bold text-ink-700">
                        {tool.name.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-display text-lg font-bold text-text-strong">
                          {tool.name}
                          {tool.verified_at && <VerifiedBadge variant="outline" />}
                        </span>
                        <span className="block text-sm text-ink-700">{tool.category}</span>
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <LocalFitMeter fit={fit} showLabel={false} />
                        <span className="font-mono text-[13.5px] text-text-strong">{tool.price_label ?? tool.price_type}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center gap-4">
                <Link href="/tools" className="text-sm font-semibold text-text-link no-underline hover:underline">
                  Browse all tools →
                </Link>
                <Button variant="ghost" onClick={() => setQuery('')}>
                  Clear
                </Button>
              </div>
            </>
          )}
          {query.trim() && results.length === 0 && (
            <div className="flex flex-col items-start gap-3 rounded-xl border-thick border-dashed border-border-strong p-5 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <p className="font-display text-lg font-bold tracking-title text-text-strong">Nothing scored for &ldquo;{query}&rdquo; yet.</p>
                <p className="mt-1 text-[15px] text-text-muted">Try a category above, or tell us what you need and we&apos;ll test it.</p>
                <div className="mt-3 flex items-center gap-4">
                  <Link href="/tools" className="text-sm font-semibold text-text-link no-underline hover:underline">
                    Browse all tools →
                  </Link>
                  <Button variant="ghost" onClick={() => setQuery('')}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
