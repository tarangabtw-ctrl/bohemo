'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Tool } from '@/types'
import { TOOL_CATEGORIES } from '@/types'
import type { SearchIndex, SearchStory } from '@/lib/queries'
import { computeLocalFit } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { formatDate, priceLabel } from '@/lib/utils'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { OPEN_SEARCH_EVENT, addRecentSearch, readRecentSearches, writeRecentSearches } from '@/lib/search'
import { useMarket } from './MarketProvider'
import { Icon } from './Icon'
import { FilterChip } from './FilterChip'
import { LocalFitMeter } from './LocalFitMeter'
import { Skeleton } from './Skeleton'

type IndexState = { status: 'idle' | 'loading' | 'error' } | { status: 'ready'; data: SearchIndex }

interface Option {
  key: string
  href?: string
  /** For recent searches: put this text back in the box instead of navigating. */
  fill?: string
}

const has = (text: string | null | undefined, q: string) => (text ?? '').toLowerCase().includes(q)

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-cream-300 px-px font-bold text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

function toolMatchNote(tool: Tool, q: string): string | null {
  if (has(tool.name, q) || has(tool.category, q)) return null
  const lang = tool.languages?.find((l) => has(l, q))
  if (lang) return lang
  const pay = tool.payment_methods?.find((p) => has(p, q))
  if (pay) return pay
  const tag = tool.tags.find((t) => has(t, q))
  return tag ?? 'matches description'
}

function search(data: SearchIndex, query: string, marketId: string, marketName: string) {
  const q = query.trim().toLowerCase()
  const tasks = TOOL_CATEGORIES.filter((c) => has(c, q)).map((c) => ({
    category: c,
    count: data.tools.filter((t) => t.category === c).length,
  }))
  const tools = data.tools
    .filter(
      (t) =>
        has(t.name, q) ||
        has(t.category, q) ||
        has(t.description, q) ||
        t.tags.some((x) => has(x, q)) ||
        (t.languages ?? []).some((x) => has(x, q)) ||
        (t.payment_methods ?? []).some((x) => has(x, q)),
    )
    .map((tool) => ({ tool, fit: computeLocalFit(tool, marketId, marketName) }))
    .sort((a, b) => b.fit.confirmed - a.fit.confirmed)
  const stories = data.stories.filter((s: SearchStory) => has(s.title, q) || has(s.excerpt, q) || has(s.why_it_matters, q))
  return { tasks, tools, stories }
}

const ROW =
  'flex min-h-[56px] w-full items-center gap-3.5 rounded-sm px-3 py-1.5 text-left text-text-strong no-underline outline-none hover:bg-cream-200 data-[active=true]:bg-cream-200'
const ROW_ICON = 'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-200 text-ink-700'
const GROUP_HEAD = 'flex min-h-10 items-center justify-between gap-3 px-3 pt-1'
const LABEL = 'font-mono text-label font-medium uppercase text-text-muted'
const TEXT_BTN =
  'inline-flex min-h-hit-min items-center rounded-pill px-2 text-sm font-semibold text-text-strong underline underline-offset-4 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring'
const MORE_LINK = 'inline-flex min-h-hit-min items-center text-[15px] font-semibold text-text-strong no-underline hover:underline'

/** ⌘K / "/" search across tasks, tools and stories. Mounted once in the root layout. */
export function CommandSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<IndexState>({ status: 'idle' })
  const [recent, setRecent] = useState<string[]>([])
  const [active, setActive] = useState(0)

  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const close = useCallback(() => setOpen(false), [])
  useFocusTrap(panelRef, open, close)

  const load = useCallback(async () => {
    setIndex({ status: 'loading' })
    try {
      const res = await fetch('/api/search')
      if (!res.ok) throw new Error('search index failed')
      const data = (await res.json()) as SearchIndex
      setIndex({ status: 'ready', data })
    } catch {
      setIndex({ status: 'error' })
    }
  }, [])

  // Open from ⌘K / Ctrl+K, "/" (when not typing somewhere), or openSearch() anywhere on the site.
  useEffect(() => {
    function show(q: string) {
      setQuery(q)
      setActive(0)
      setRecent(readRecentSearches())
      setOpen(true)
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        show('')
        return
      }
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      e.preventDefault()
      show('')
    }
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<{ query?: string }>).detail
      show(detail?.query ?? '')
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen)
    }
  }, [])

  // First open loads the search data; focus goes to the box; the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return
    if (index.status === 'idle') load()
    inputRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, index.status, load])

  // Navigating anywhere closes it.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const q = query.trim().toLowerCase()
  const results = useMemo(
    () => (q && index.status === 'ready' ? search(index.data, q, current.id, current.name) : null),
    [q, index, current.id, current.name],
  )

  // Flat list of options, in screen order, for the arrow keys.
  const options: Option[] = useMemo(() => {
    if (!q) return recent.map((r) => ({ key: `recent-${r}`, fill: r }))
    if (!results) return []
    return [
      ...results.tasks.map((t) => ({ key: `task-${t.category}`, href: `/tools?task=${encodeURIComponent(t.category)}` })),
      ...results.tools.slice(0, 4).map(({ tool }) => ({ key: `tool-${tool.slug}`, href: `/tools/${tool.slug}` })),
      ...results.stories.slice(0, 3).map((s) => ({ key: `story-${s.id}`, href: `/news/${s.id}` })),
    ]
  }, [q, recent, results])

  useEffect(() => setActive(0), [q])

  const optionId = (i: number) => `${listId}-opt-${i}`
  const activeIndex = Math.min(active, Math.max(options.length - 1, 0))

  function remember() {
    if (!q) return
    const next = addRecentSearch(recent, query)
    setRecent(next)
    writeRecentSearches(next)
  }

  function choose(option: Option) {
    if (option.fill !== undefined) {
      setQuery(option.fill)
      inputRef.current?.focus()
      return
    }
    if (option.href) {
      remember()
      setOpen(false)
      router.push(option.href)
    }
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (options.length === 0) return
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((activeIndex + step + options.length) % options.length)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const option = options[activeIndex]
      if (option) choose(option)
      else if (q) {
        remember()
        setOpen(false)
        router.push(`/tools?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  function removeRecent(item: string) {
    const next = recent.filter((r) => r !== item)
    setRecent(next)
    writeRecentSearches(next)
    inputRef.current?.focus()
  }

  function clearRecent() {
    setRecent([])
    writeRecentSearches([])
    inputRef.current?.focus()
  }

  if (!open) return null

  let n = -1
  const rowProps = (option: Option) => {
    n += 1
    const i = n
    return {
      id: optionId(i),
      role: 'option' as const,
      'aria-selected': i === activeIndex,
      'data-active': i === activeIndex,
      onMouseMove: () => setActive(i),
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        choose(option)
      },
    }
  }

  const total = results ? results.tasks.length + results.tools.length + results.stories.length : 0

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 hidden bg-ink-900/40 md:block" aria-hidden="true" onClick={close} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search Bohemo"
        className="absolute inset-0 flex flex-col overflow-hidden bg-surface-overlay md:inset-x-auto md:bottom-auto md:left-1/2 md:top-[88px] md:w-[min(720px,calc(100%-48px))] md:-translate-x-1/2 md:rounded-lg md:border-hairline md:border-ink-900 md:shadow-overlay"
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b-heavy border-ink-900 pl-4 pr-2 md:h-[68px] md:gap-3 md:border-b-hairline md:border-border-hairline md:pl-[22px] md:pr-4">
          <Icon name="search" size={20} className="shrink-0 text-ink-700" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls={listId}
            aria-activedescendant={options.length > 0 ? optionId(activeIndex) : undefined}
            aria-autocomplete="list"
            aria-label="Search tasks, tools and stories"
            placeholder="Search tasks, tools and stories"
            autoComplete="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent font-body text-[17px] text-text-strong outline-none placeholder:text-ink-600 md:text-[19px]"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-700 outline-none hover:bg-cream-200 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
            >
              <Icon name="x" size={18} />
            </button>
          )}
          <button type="button" onClick={close} className={`${TEXT_BTN} no-underline md:hidden`}>
            Cancel
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="hidden h-7 items-center rounded-xs bg-cream-300 px-2 font-mono text-xs text-ink-700 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring md:inline-flex"
          >
            esc
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4 pt-1 md:max-h-[600px] md:px-2 md:pb-2.5 md:pt-1.5">
          <div id={listId} role="listbox" aria-label="Search results">
            {!q && (
              <>
                {recent.length > 0 && (
                  <div role="group" aria-label="Recent searches">
                    <div className={GROUP_HEAD}>
                      <span className={LABEL}>Recent searches</span>
                      <button type="button" onClick={clearRecent} className={TEXT_BTN}>
                        Clear
                      </button>
                    </div>
                    {recent.map((r) => {
                      const option = options.find((o) => o.fill === r)
                      if (!option) return null
                      return (
                        <div key={r} className="flex items-center">
                          <div {...rowProps(option)} className={`${ROW} cursor-pointer`}>
                            <span className={ROW_ICON} aria-hidden="true">
                              <Icon name="clock" size={18} />
                            </span>
                            <span className="min-w-0 flex-1 text-[15.5px] font-semibold">{r}</span>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${r}`}
                            onClick={() => removeRecent(r)}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-700 outline-none hover:bg-cream-300 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
                          >
                            <Icon name="x" size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div role="group" aria-label="Search by task" className={recent.length > 0 ? 'mt-1.5 border-t-hairline border-border-hairline pt-1' : ''}>
                  <div className={GROUP_HEAD}>
                    <span className={LABEL}>Search by task</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1.5 md:flex-wrap">
                    {TOOL_CATEGORIES.map((c) => (
                      <FilterChip
                        key={c}
                        className="shrink-0"
                        onClick={() => {
                          setQuery(c)
                          inputRef.current?.focus()
                        }}
                      >
                        {c}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <p className="px-3 pb-1 pt-2.5 text-sm text-ink-700">
                  Search by what you need done, a tool&apos;s name, a language or a payment method.
                </p>
              </>
            )}

            {q && (index.status === 'loading' || index.status === 'idle') && (
              <div className="grid gap-4 px-3 py-6">
                <Skeleton variant="mark" label="Loading search" />
              </div>
            )}

            {q && index.status === 'error' && (
              <div className="grid justify-items-start gap-2 px-3 py-6" role="alert">
                <p className="font-display text-[21px] font-bold tracking-title">That broke.</p>
                <p className="text-body-sm text-text-muted">Our fault, not yours. Try again.</p>
                <button type="button" onClick={load} className={TEXT_BTN}>
                  Try again
                </button>
              </div>
            )}

            {results && total > 0 && (
              <>
                {results.tasks.length > 0 && (
                  <div role="group" aria-label="Tasks">
                    <div className={GROUP_HEAD}>
                      <span className={LABEL}>
                        Tasks <span className="ml-1 font-mono tracking-normal">{results.tasks.length}</span>
                      </span>
                    </div>
                    {results.tasks.map((t) => {
                      const option = options.find((o) => o.key === `task-${t.category}`) as Option
                      return (
                        <a key={t.category} href={option.href} {...rowProps(option)} className={ROW}>
                          <span className={ROW_ICON} aria-hidden="true">
                            <Icon name="layout-grid" size={18} />
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="text-[15.5px] font-semibold leading-snug">
                              <Highlight text={t.category} q={q} />
                            </span>
                            <span className="font-mono text-xs text-ink-700">
                              {t.count} {t.count === 1 ? 'tool' : 'tools'}
                            </span>
                          </span>
                          <Icon name="arrow-right" size={18} className="shrink-0 text-ink-700" />
                        </a>
                      )
                    })}
                  </div>
                )}

                {results.tools.length > 0 && (
                  <div role="group" aria-label="Tools" className={results.tasks.length > 0 ? 'mt-1.5 border-t-hairline border-border-hairline pt-1' : ''}>
                    <div className={GROUP_HEAD}>
                      <span className={LABEL}>
                        Tools <span className="ml-1 font-mono tracking-normal">{results.tools.length}</span>
                      </span>
                      {results.tools.length > 4 && (
                        <a
                          href={`/tools?q=${encodeURIComponent(query.trim())}`}
                          onClick={(e) => {
                            e.preventDefault()
                            remember()
                            setOpen(false)
                            router.push(`/tools?q=${encodeURIComponent(query.trim())}`)
                          }}
                          className="inline-flex min-h-hit-min items-center whitespace-nowrap text-sm font-semibold text-text-strong"
                        >
                          All {results.tools.length} tools →
                        </a>
                      )}
                    </div>
                    {results.tools.slice(0, 4).map(({ tool, fit }) => {
                      const option = options.find((o) => o.key === `tool-${tool.slug}`) as Option
                      const note = toolMatchNote(tool, q)
                      return (
                        <a key={tool.slug} href={option.href} {...rowProps(option)} className={ROW}>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-surface-inset font-display text-[15px] font-extrabold text-ink-700" aria-hidden="true">
                            {tool.name.charAt(0)}
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="text-[15.5px] font-semibold leading-snug">
                              <Highlight text={tool.name} q={q} />
                            </span>
                            <span className="truncate font-mono text-xs text-ink-700">
                              {tool.category}
                              {note ? ` · ${note}` : ''}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-4">
                            <LocalFitMeter fit={fit} showLabel={false} showCount={false} />
                            <span className="hidden w-[150px] truncate text-right font-mono text-[12.5px] text-ink-700 md:inline">{priceLabel(tool)}</span>
                          </span>
                        </a>
                      )
                    })}
                  </div>
                )}

                {results.stories.length > 0 && (
                  <div
                    role="group"
                    aria-label="Stories"
                    className={results.tasks.length + results.tools.length > 0 ? 'mt-1.5 border-t-hairline border-border-hairline pt-1' : ''}
                  >
                    <div className={GROUP_HEAD}>
                      <span className={LABEL}>
                        Stories <span className="ml-1 font-mono tracking-normal">{results.stories.length}</span>
                      </span>
                    </div>
                    {results.stories.slice(0, 3).map((s) => {
                      const option = options.find((o) => o.key === `story-${s.id}`) as Option
                      return (
                        <a key={s.id} href={option.href} {...rowProps(option)} className={ROW}>
                          <span className={ROW_ICON} aria-hidden="true">
                            <Icon name="newspaper" size={18} />
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="text-pretty text-[15.5px] font-medium leading-snug">
                              <Highlight text={s.title} q={q} />
                            </span>
                            <span className="font-mono text-xs text-ink-700">
                              {s.source} · {formatDate(s.published_at)}
                            </span>
                          </span>
                        </a>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {results && total === 0 && (
            <div className="grid gap-4 px-4 py-7 md:grid-cols-[120px_minmax(0,1fr)] md:items-center md:gap-7 md:px-6 md:py-8" role="status">
              <div className="grid w-[120px] gap-2" aria-hidden="true">
                <div className="flex gap-2">
                  <span className="h-[22px] flex-1 rounded-pill border-thick border-dashed border-border-strong" />
                  <span className="h-[22px] w-[22px] shrink-0 rounded-full border-thick border-dashed border-border-strong" />
                </div>
                <div className="flex gap-2">
                  <span className="h-[22px] flex-1 rounded-pill border-thick border-dashed border-border-strong" />
                </div>
              </div>
              <div>
                <p className="mb-1 font-display text-[21px] font-bold tracking-title text-text-strong">Nothing for &ldquo;{query.trim()}&rdquo; yet.</p>
                <p className="text-body-sm text-text-muted">Try what you need done, like &ldquo;video&rdquo;, or a language.</p>
                <div className="mt-1 flex flex-wrap gap-x-6">
                  <a href="/tools" className={MORE_LINK}>
                    Browse all tools →
                  </a>
                  <a href="/get-listed" className={MORE_LINK}>
                    Know a tool we&apos;re missing? →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-5 border-t-hairline border-border-hairline bg-surface-raised px-5 py-2.5 font-mono text-xs text-ink-700 md:flex" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>move
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↵</Kbd>open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>esc</Kbd>close
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <Kbd>⌘K</Kbd>or<Kbd>/</Kbd>search from anywhere
          </span>
        </div>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-[22px] items-center rounded-xs bg-cream-300 px-1.5 text-[11.5px]">{children}</span>
}
