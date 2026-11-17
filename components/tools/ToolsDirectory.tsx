'use client'

import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Tool } from '@/types'
import { TOOL_CATEGORIES, PRICE_TYPES } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { useMarket } from '../MarketProvider'
import { MARKETS } from '@/lib/markets'
import { useSavedTools, useCompareTray } from '@/lib/savedAndCompare'
import { Icon } from '../Icon'
import { Button } from '../Button'
import { FilterChip } from '../FilterChip'
import { ToolCard } from '../ToolCard'
import { EmptyState } from '../EmptyState'
import { StacksTab } from './StacksTab'

interface ToolsDirectoryProps {
  tools: Tool[]
}

type SortKey = 'fit' | 'newest' | 'name'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'fit', label: 'Local Fit' },
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name A–Z' },
]

export function ToolsDirectory({ tools }: ToolsDirectoryProps) {
  const { market } = useMarket()
  const currentMarket = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  const { isSaved, toggle: toggleSave } = useSavedTools()
  const { compare, isComparing, toggle: toggleCompare, max } = useCompareTray()

  const [tab, setTab] = useState<'all' | 'stacks'>('all')
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [prices, setPrices] = useState<string[]>([])
  const [madeInAsiaOnly, setMadeInAsiaOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('fit')
  const [sortOpen, setSortOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const searchId = useId()

  const anyVerified = tools.some((t) => t.verified_at)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tools.filter((t) => {
      if (categories.length && !categories.includes(t.category)) return false
      if (prices.length && !prices.includes(t.price_type)) return false
      if (madeInAsiaOnly && !t.made_in_asia) return false
      if (verifiedOnly && !t.verified_at) return false
      if (q) {
        const haystack = [t.name, t.category, t.description, ...t.tags].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [tools, categories, prices, madeInAsiaOnly, verifiedOnly, query])

  const withFit = useMemo(
    () => filtered.map((tool) => ({ tool, fit: computeLocalFit(tool, currentMarket.id, currentMarket.name) })),
    [filtered, currentMarket.id, currentMarket.name],
  )

  const sorted = useMemo(() => {
    const copy = [...withFit]
    if (sort === 'fit') copy.sort((a, b) => b.fit.confirmed - a.fit.confirmed)
    else if (sort === 'newest') copy.sort((a, b) => new Date(b.tool.created_at).getTime() - new Date(a.tool.created_at).getTime())
    else copy.sort((a, b) => a.tool.name.localeCompare(b.tool.name))
    return copy
  }, [withFit, sort])

  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    ...categories.map((c) => ({ key: `cat-${c}`, label: c, clear: () => setCategories((prev) => prev.filter((x) => x !== c)) })),
    ...prices.map((p) => ({
      key: `price-${p}`,
      label: PRICE_TYPES.find((pt) => pt.value === p)?.label ?? p,
      clear: () => setPrices((prev) => prev.filter((x) => x !== p)),
    })),
    ...(madeInAsiaOnly ? [{ key: 'asia', label: 'Made in Asia', clear: () => setMadeInAsiaOnly(false) }] : []),
    ...(verifiedOnly ? [{ key: 'verified', label: 'Bohemo Verified only', clear: () => setVerifiedOnly(false) }] : []),
  ]

  function clearAll() {
    setCategories([])
    setPrices([])
    setMadeInAsiaOnly(false)
    setVerifiedOnly(false)
    setQuery('')
  }

  const FilterGroups = (
    <>
      <fieldset className="border-0 p-0">
        <legend className="mb-2 font-mono text-label font-medium uppercase tracking-label text-text-muted">Category</legend>
        <div className="flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              selected={categories.includes(c)}
              onClick={() => setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
            >
              {c}
            </FilterChip>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5 border-0 p-0">
        <legend className="mb-2 font-mono text-label font-medium uppercase tracking-label text-text-muted">Price</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_TYPES.map((p) => (
            <FilterChip
              key={p.value}
              selected={prices.includes(p.value)}
              onClick={() => setPrices((prev) => (prev.includes(p.value) ? prev.filter((x) => x !== p.value) : [...prev, p.value]))}
            >
              {p.label}
            </FilterChip>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5 border-0 p-0">
        <legend className="mb-2 font-mono text-label font-medium uppercase tracking-label text-text-muted">Origin and checks</legend>
        <div className="flex flex-wrap gap-2">
          <FilterChip selected={madeInAsiaOnly} onClick={() => setMadeInAsiaOnly((v) => !v)}>
            Made in Asia
          </FilterChip>
          {anyVerified && (
            <FilterChip selected={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}>
              Bohemo Verified only
            </FilterChip>
          )}
        </div>
      </fieldset>
    </>
  )

  return (
    <div className="mx-auto max-w-container px-4 pb-10 md:px-6">
      <section className="py-6 md:py-8">
        <p className="font-mono text-label font-medium uppercase tracking-label text-text-muted">Directory</p>
        <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-display-l font-extrabold text-text-strong">Tools, ranked for {currentMarket.name}</h1>
          <p className="font-mono text-[13px] text-text-muted">
            <b className="text-text-strong">{tools.length} tools</b> · prices in {currentMarket.currency}
          </p>
        </div>

        <label htmlFor={searchId} className="sr-only">
          Search tools
        </label>
        <div className="mt-5 flex items-center gap-3 rounded-pill border-thin border-border-strong bg-surface-raised px-4 py-1 focus-within:outline focus-within:outline-thick focus-within:outline-focus-ring focus-within:outline-offset-2">
          <Icon name="search" size={20} className="text-ink-600" />
          <input
            id={searchId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need to do?"
            className="h-12 min-w-0 flex-1 bg-transparent font-body text-base text-text-strong outline-none placeholder:text-ink-600"
          />
          {query && <Button variant="ghost" icon="x" label="Clear search" onClick={() => setQuery('')} />}
        </div>

        <div role="tablist" className="mt-5 flex gap-2">
          <button
            role="tab"
            aria-selected={tab === 'all'}
            onClick={() => setTab('all')}
            className={`inline-flex min-h-hit-min items-center gap-1.5 rounded-pill border-thin px-4 text-sm font-semibold outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
              tab === 'all' ? 'border-ink-900 bg-ink-900 text-cream-200' : 'border-border-strong text-text-strong'
            }`}
          >
            All tools <span className="font-mono text-xs">{tools.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'stacks'}
            onClick={() => setTab('stacks')}
            className={`inline-flex min-h-hit-min items-center gap-1.5 rounded-pill border-thin px-4 text-sm font-semibold outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
              tab === 'stacks' ? 'border-ink-900 bg-ink-900 text-cream-200' : 'border-border-strong text-text-strong'
            }`}
          >
            Stacks
          </button>
        </div>
      </section>

      {tab === 'stacks' ? (
        <StacksTab tools={tools} marketId={currentMarket.id} marketName={currentMarket.name} />
      ) : tools.length === 0 ? (
        <EmptyState
          kind="empty"
          title="No tools here yet."
          body={`We're still checking the first tools for ${currentMarket.name}. We'd rather show you nothing than show you junk.`}
          actionHref="/news"
          actionLabel="Read today's AI news instead"
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block" aria-label="Filters">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-strong">Filters</h2>
              {activeFilters.length > 0 && (
                <button type="button" onClick={clearAll} className="text-sm font-semibold text-text-link hover:underline">
                  Clear all
                </button>
              )}
            </div>
            {FilterGroups}
          </aside>

          <section aria-live="polite">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[13px] text-text-muted">
                {sorted.length === tools.length ? `All ${sorted.length} tools` : `${sorted.length} of ${tools.length} tools`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterSheetOpen(true)}
                  className="inline-flex min-h-hit-min items-center gap-1.5 rounded-pill border-thin border-border-strong px-4 text-sm font-medium text-text-strong md:hidden"
                >
                  <Icon name="sliders-horizontal" size={16} />
                  Filters
                  {activeFilters.length > 0 && <span className="font-mono text-xs text-text-muted">{activeFilters.length}</span>}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                    onClick={() => setSortOpen((o) => !o)}
                    className="inline-flex min-h-hit-min items-center gap-1.5 whitespace-nowrap rounded-pill border-hairline border-border-strong bg-surface-raised px-3.5 text-sm font-semibold text-text-strong"
                  >
                    Sort: <b>{SORTS.find((s) => s.key === sort)?.label}</b>
                    <Icon name="chevron-down" size={16} />
                  </button>
                  {sortOpen && (
                    <ul role="listbox" className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[180px] list-none rounded-lg border-hairline border-border-hairline bg-surface-overlay p-1.5 shadow-overlay">
                      {SORTS.map((s) => (
                        <li
                          key={s.key}
                          role="option"
                          aria-selected={s.key === sort}
                          onClick={() => {
                            setSort(s.key)
                            setSortOpen(false)
                          }}
                          className="flex min-h-hit-min cursor-pointer items-center rounded-sm px-3 text-[15px] text-text-strong hover:bg-cream-100"
                        >
                          {s.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={f.clear}
                    aria-label={`Remove filter: ${f.label}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-cream-300 px-3 text-sm font-medium text-text-strong"
                  >
                    {f.label}
                    <Icon name="x" size={15} />
                  </button>
                ))}
              </div>
            )}

            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sorted.map(({ tool }) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    marketId={currentMarket.id}
                    marketName={currentMarket.name}
                    saved={isSaved(tool.slug)}
                    onToggleSave={() => toggleSave(tool.slug)}
                    comparing={isComparing(tool.slug)}
                    compareDisabled={compare.length >= max}
                    onToggleCompare={() => toggleCompare(tool.slug)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-hairline border-border-hairline p-8 text-center">
                <h2 className="text-title-1 font-bold text-text-strong">No tools match.</h2>
                <p className="mt-2 text-[15px] text-text-muted">Remove a filter to see tools again.</p>
                <button type="button" onClick={clearAll} className="mt-4 text-sm font-semibold text-text-link hover:underline">
                  Clear everything
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Mobile filter sheet */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-900/45" onClick={() => setFilterSheetOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Filters" className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-xl rounded-b-none bg-surface-overlay p-5 shadow-overlay">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-strong">Filters</h2>
              <Button variant="ghost" icon="x" label="Close filters" onClick={() => setFilterSheetOpen(false)} />
            </div>
            {FilterGroups}
            <div className="mt-6">
              <Button block onClick={() => setFilterSheetOpen(false)}>
                Show {sorted.length} {sorted.length === 1 ? 'tool' : 'tools'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compare tray */}
      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-[64px] z-30 border-t-hairline border-border-hairline bg-surface-overlay p-3 shadow-overlay md:bottom-0">
          <div className="mx-auto flex max-w-container flex-wrap items-center gap-3 px-1">
            <span className="font-mono text-label font-medium uppercase tracking-label text-text-muted">
              Compare · {compare.length} of {max}
            </span>
            <div className="flex flex-wrap gap-2">
              {compare.map((slug) => {
                const tool = tools.find((t) => t.slug === slug)
                if (!tool) return null
                return (
                  <span key={slug} className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-cream-300 pl-1 pr-2.5 text-sm font-medium text-text-strong">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-inset font-display text-xs font-bold">{tool.name.charAt(0)}</span>
                    {tool.name}
                    <button type="button" aria-label={`Remove ${tool.name}`} onClick={() => toggleCompare(slug)}>
                      <Icon name="x" size={14} />
                    </button>
                  </span>
                )
              })}
            </div>
            <div className="ml-auto flex items-center gap-3">
              {compare.length < 2 && <span className="text-[13px] text-text-muted">Add one more to compare.</span>}
              <Link
                href={`/compare?tools=${compare.join(',')}`}
                aria-disabled={compare.length < 2}
                className={`inline-flex min-h-hit-min items-center gap-1.5 rounded-pill bg-ink-900 px-5 text-sm font-semibold text-cream-200 no-underline ${
                  compare.length < 2 ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                Compare
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
