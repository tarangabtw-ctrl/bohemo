'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { NewsArticle, Tool } from '@/types'
import { MARKETS } from '@/lib/markets'
import { track } from '@/lib/analytics'
import { GET_PRO_HREF, PRO_PRICE } from '@/lib/pricing'
import { formatDate } from '@/lib/utils'
import { useCompareTray, useSavedStories, useSavedTools } from '@/lib/savedAndCompare'
import { useMarket } from '../MarketProvider'
import { Button } from '../Button'
import { EmptyState } from '../EmptyState'
import { Icon } from '../Icon'
import { Skeleton } from '../Skeleton'
import { Tag } from '../Tag'
import { ToolCard } from '../ToolCard'

/** Free keeps up to this many saves (tools and stories together). */
export const FREE_SAVE_LIMIT = 20
const NUDGE_AFTER = 3
const NUDGE_KEY = 'bohemo:saves-nudge-dismissed'

type TabId = 'tools' | 'stories'

interface SavedViewProps {
  tools: Tool[]
  stories: NewsArticle[]
}

const MORE_LINK = 'inline-flex min-h-hit-min items-center text-[15px] font-semibold text-text-strong no-underline hover:underline'

function Meter({ n }: { n: number }) {
  const full = n >= FREE_SAVE_LIMIT
  return (
    <div className="grid gap-2 md:w-[300px] md:pb-1.5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-mono">
          <b className="font-semibold">{n}</b> of {FREE_SAVE_LIMIT} saves
        </span>
        <span className="font-mono text-label font-medium uppercase text-text-muted">Free</span>
      </div>
      <div className="h-2 overflow-hidden rounded-pill bg-cream-300" role="img" aria-label={`${n} of ${FREE_SAVE_LIMIT} saves used`}>
        <span className="block h-full rounded-pill bg-ink-900" style={{ width: `${Math.min(100, (n / FREE_SAVE_LIMIT) * 100)}%` }} />
      </div>
      {!full && (
        <Link href="/pricing" className="justify-self-end text-[13.5px] font-semibold text-text-strong">
          Unlimited with Pro
        </Link>
      )}
    </div>
  )
}

export function SavedView({ tools, stories }: SavedViewProps) {
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  const { saved: savedSlugs, isSaved: isToolSaved, toggle: toggleTool } = useSavedTools()
  const { saved: savedIds, isSaved: isStorySaved, toggle: toggleStory } = useSavedStories()
  const { compare, isComparing, toggle: toggleCompare, max } = useCompareTray()

  const [ready, setReady] = useState(false)
  // What was saved when the page opened. Un-saving here keeps the row on screen
  // (with the button off), so focus and the reader's place don't jump.
  const [shownSlugs, setShownSlugs] = useState<string[]>([])
  const [shownIds, setShownIds] = useState<string[]>([])
  const [tab, setTab] = useState<TabId>('tools')
  const [nudgeDismissed, setNudgeDismissed] = useState(true)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    setReady(true)
    try {
      setNudgeDismissed(window.localStorage.getItem(NUDGE_KEY) === '1')
    } catch {
      setNudgeDismissed(false)
    }
  }, [])

  // Take the snapshot once, after the stored lists have loaded (they load in the same mount as `ready`).
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!ready || loaded) return
    setShownSlugs(savedSlugs)
    setShownIds(savedIds)
    setLoaded(true)
  }, [ready, loaded, savedSlugs, savedIds])

  const shownTools = shownSlugs.map((s) => tools.find((t) => t.slug === s)).filter((t): t is Tool => Boolean(t))
  const shownStories = shownIds.map((id) => stories.find((s) => s.id === id)).filter((s): s is NewsArticle => Boolean(s))

  // The count only includes saves that still exist in the database.
  const n =
    savedSlugs.filter((s) => tools.some((t) => t.slug === s)).length + savedIds.filter((id) => stories.some((s) => s.id === id)).length

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'tools' as const, label: 'Tools', count: shownTools.length },
    { id: 'stories' as const, label: 'Stories', count: shownStories.length },
  ].filter((t) => t.count > 0)
  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id

  function dismissNudge() {
    setNudgeDismissed(true)
    try {
      window.localStorage.setItem(NUDGE_KEY, '1')
    } catch {
      // keep it dismissed for this visit
    }
  }

  function onTabKey(e: React.KeyboardEvent, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const last = tabs.length - 1
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? last : (index + (e.key === 'ArrowLeft' ? -1 : 1) + tabs.length) % tabs.length
    setTab(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  const empty = loaded && shownTools.length === 0 && shownStories.length === 0

  return (
    <div>
      <header className="mx-auto max-w-container px-4 pt-6 md:px-6 md:pt-10">
        <div className="grid gap-4 md:flex md:items-end md:justify-between md:gap-6">
          <h1 className="font-display text-display-l font-extrabold text-text-strong">Saved</h1>
          {loaded && n > 0 && <Meter n={n} />}
        </div>
        {tabs.length > 0 && (
          <div role="tablist" aria-label="Saved" className="mt-5 flex gap-1 border-b-hairline border-border-hairline">
            {tabs.map((t, i) => {
              const selected = t.id === activeTab
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  id={`saved-tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`saved-panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`-mb-px inline-flex min-h-hit-min items-center gap-2 border-b-heavy px-3 text-[15px] font-semibold outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring ${
                    selected ? 'border-ink-900 text-text-strong' : 'border-transparent text-ink-700 hover:text-text-strong'
                  }`}
                >
                  {t.label}
                  <span className="font-mono text-xs text-text-muted">{t.count}</span>
                </button>
              )
            })}
          </div>
        )}
      </header>

      <div className="mx-auto max-w-container px-4 pb-8 pt-5 md:px-6 md:pb-16 md:pt-7">
        {!loaded && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
            <Skeleton variant="card" label="Loading your saves" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        )}

        {loaded && n >= NUDGE_AFTER && n < FREE_SAVE_LIMIT && !nudgeDismissed && (
          <section
            aria-labelledby="saved-nudge"
            className="mb-6 grid gap-3 rounded-lg border-hairline border-ink-900 bg-surface-raised p-5 md:grid-cols-[44px_minmax(0,1fr)_auto] md:items-center md:gap-5 md:px-6"
          >
            <span className="hidden h-11 w-11 place-items-center rounded-full bg-cream-300 md:grid" aria-hidden="true">
              <Icon name="smartphone" size={20} />
            </span>
            <div>
              <h2 id="saved-nudge" className="font-display text-title-3 font-bold text-text-strong">
                Keep your saves on every device
              </h2>
              <p className="mt-1 text-pretty text-body-sm text-ink-700">
                Your {n} saves are in this browser only. Sign in and they follow you to your phone and laptop. No password.
              </p>
            </div>
            <div className="grid gap-2 md:flex md:items-center md:gap-3">
              <Button href="/sign-in?from=saves" onClick={() => track('signup_from_saves', { method: 'email', saves: n })}>
                Continue with email
              </Button>
              <Button
                variant="secondary"
                href="/sign-in?from=saves&with=google"
                onClick={() => track('signup_from_saves', { method: 'google', saves: n })}
              >
                Continue with Google
              </Button>
              <button
                type="button"
                onClick={dismissNudge}
                className="inline-flex min-h-hit-min items-center justify-self-center rounded-pill px-2 text-sm font-semibold text-text-strong underline underline-offset-4 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
              >
                Not now
              </button>
            </div>
          </section>
        )}

        {loaded && n >= FREE_SAVE_LIMIT && (
          <section
            aria-labelledby="saved-limit"
            className="mb-6 grid gap-5 rounded-lg bg-surface-inverse px-5 py-6 text-cream-200 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-12 md:px-8 md:py-7"
          >
            <div>
              <p className="font-mono text-label font-medium uppercase text-sand-400">
                Free · {FREE_SAVE_LIMIT} of {FREE_SAVE_LIMIT} saves
              </p>
              <h2 id="saved-limit" className="mt-1.5 font-display text-[25px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[30px]">
                Your saves are full.
              </h2>
              <p className="mt-2 max-w-[640px] text-pretty text-body leading-normal text-sand-300">
                Free keeps up to {FREE_SAVE_LIMIT}. Pro has unlimited saves and stacks, and tells you when a saved tool changes its price. Or
                remove a save to make room.
              </p>
            </div>
            <div className="grid justify-items-center gap-2">
              <Link
                href={GET_PRO_HREF}
                className="inline-flex min-h-hit-min w-full items-center justify-center rounded-pill bg-cream-200 px-[22px] text-[15px] font-semibold text-ink-900 no-underline outline-none hover:bg-paper-0 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring-inverse focus-visible:outline-offset-2 md:w-auto"
              >
                Get Pro · {PRO_PRICE.annual}/yr
              </Link>
              <span className="text-[13.5px] text-sand-300">
                or {PRO_PRICE.monthly}/mo ·{' '}
                <Link href="/pricing" className="text-cream-200 underline underline-offset-2">
                  See what’s in Pro
                </Link>
              </span>
            </div>
          </section>
        )}

        {empty && (
          <div className="grid justify-items-center gap-1 border-t-heavy border-ink-900 pb-10 pt-6">
            <EmptyState
              kind="empty"
              title="Nothing saved yet."
              body="Tap the bookmark on any tool or story and it waits for you here."
              actionLabel="Browse tools"
              actionHref="/tools"
            />
            <Link href="/news" className={MORE_LINK}>
              Or read today’s edition →
            </Link>
          </div>
        )}

        {loaded && activeTab === 'tools' && (
          <div id="saved-panel-tools" role="tabpanel" aria-labelledby="saved-tab-tools">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shownTools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  marketId={current.id}
                  marketName={current.name}
                  saved={isToolSaved(tool.slug)}
                  onToggleSave={() => toggleTool(tool.slug)}
                  comparing={isComparing(tool.slug)}
                  compareDisabled={compare.length >= max}
                  onToggleCompare={() => toggleCompare(tool.slug)}
                />
              ))}
            </div>
            {compare.length >= 2 && (
              <div className="mt-5">
                <Button href={`/compare?tools=${compare.join(',')}`} iconRight="arrow-right">
                  Compare {compare.length} tools
                </Button>
              </div>
            )}
          </div>
        )}

        {loaded && activeTab === 'stories' && (
          <div id="saved-panel-stories" role="tabpanel" aria-labelledby="saved-tab-stories">
            <ol className="m-0 max-w-[880px] list-none border-t-heavy border-ink-900 p-0">
              {shownStories.map((s) => {
                const on = isStorySaved(s.id)
                return (
                  <li key={s.id} className="relative grid gap-2.5 border-b-hairline border-border-hairline py-5 pr-[52px] md:py-6 md:pr-16">
                    <div className="flex flex-wrap items-center gap-2">
                      {s.region && (
                        <Tag size="sm" variant="brown">
                          {s.region}
                        </Tag>
                      )}
                      <span className="font-mono text-xs text-ink-700">
                        {s.source} · {formatDate(s.published_at)}
                      </span>
                    </div>
                    <h3 className="text-pretty font-display text-[19px] font-bold leading-[1.2] tracking-title md:text-[23px]">
                      <Link href={`/news/${s.id}`} className="text-text-strong no-underline hover:underline">
                        {s.title}
                      </Link>
                    </h3>
                    {s.why_it_matters && (
                      <p className="text-pretty text-body-sm leading-normal text-ink-700">
                        <b className="mr-1.5 font-semibold text-text-strong">Why it matters</b>
                        {s.why_it_matters}
                      </p>
                    )}
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${on ? 'Remove from saved' : 'Save'}: ${s.title}`}
                      onClick={() => toggleStory(s.id)}
                      className="absolute -right-2 top-3 grid h-hit-min w-hit-min place-items-center rounded-full text-text-strong outline-none hover:bg-cream-300 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring md:right-0 md:top-[18px]"
                    >
                      <Icon name="bookmark" size={20} className={on ? '[&_path]:fill-current' : ''} />
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {loaded && !empty && current.id !== 'in' && (
          <p className="mt-4 text-body-sm text-text-muted">Scored and priced for India until we cover {current.name}.</p>
        )}
      </div>
    </div>
  )
}
