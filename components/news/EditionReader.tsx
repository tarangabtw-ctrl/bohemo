'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { NewsArticle, Tool } from '@/types'
import { MARKETS } from '@/lib/markets'
import { addDays, formatEditionDate, totalMinutes } from '@/lib/edition'
import { useReadStories } from '@/lib/savedAndCompare'
import { useMarket } from '../MarketProvider'
import { NewsletterForm } from '../NewsletterForm'
import { EditionProgress } from './EditionProgress'
import { EditionTime } from './EditionTime'
import { StoryItem } from './StoryItem'

export interface EditionLink {
  date: string
  number: number
  count: number
}

interface EditionReaderProps {
  stories: NewsArticle[]
  tools: Tool[]
  /** Next edition's date (YYYY-MM-DD), for "Next edition · Tue 17 Nov". */
  nextDate: string
  previous?: EditionLink
  /** Today's edition gets the progress bar and "You're caught up". A past edition is just the list. */
  live: boolean
}

const TAB =
  'inline-flex min-h-hit-min items-center gap-1.5 whitespace-nowrap rounded-pill border-thin px-4 text-sm font-semibold outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2'

export function EditionReader({ stories, tools, nextDate, previous, live }: EditionReaderProps) {
  const { market } = useMarket()
  const marketName = (MARKETS.find((m) => m.id === market) ?? MARKETS[0]).name
  const { isRead } = useReadStories()
  const [region, setRegion] = useState('All')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const total = stories.length
  const readCount = stories.filter((s) => isRead(s.id)).length
  const left = stories.filter((s) => !isRead(s.id))
  const allRead = total > 0 && readCount === total
  // A region with no stories in this edition gets no tab.
  const regions = ['All', ...Array.from(new Set(stories.map((s) => s.region).filter(Boolean)))]
  const count = (r: string) => (r === 'All' ? total : stories.filter((s) => s.region === r).length)
  const previousIsYesterday = previous?.date === addDays(nextDate, -2)
  const shown = region === 'All' ? stories : stories.filter((s) => s.region === region)

  function onTabKey(e: React.KeyboardEvent, i: number) {
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % regions.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + regions.length) % regions.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = regions.length - 1
    else return
    e.preventDefault()
    setRegion(regions[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <>
      {regions.length > 2 && (
        <div role="tablist" aria-label="Region" className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {regions.map((r, i) => (
            <button
              key={r}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              aria-selected={r === region}
              aria-controls="edition-list"
              tabIndex={r === region ? 0 : -1}
              onClick={() => setRegion(r)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`${TAB} ${r === region ? 'border-ink-900 bg-ink-900 text-cream-200' : 'border-border-strong text-text-strong'}`}
            >
              {r}
              <span className="font-mono text-xs">{count(r)}</span>
            </button>
          ))}
        </div>
      )}

      {live && (
        <div className="sticky top-[60px] z-10 -mx-4 mt-5 border-b-hairline border-ink-900 bg-surface-page px-4 md:-mx-6 md:px-6">
          <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
            <EditionProgress
              total={total}
              done={readCount}
              current={allRead ? undefined : readCount + 1}
              label={
                <span>
                  <b>
                    {readCount} of {total}
                  </b>{' '}
                  read
                </span>
              }
            />
            <span className="font-mono text-[12.5px] text-ink-700">
              {allRead
                ? 'Done for today'
                : `${left.length} ${left.length === 1 ? 'story' : 'stories'} left · ${totalMinutes(left)} min`}
            </span>
          </div>
        </div>
      )}

      <ol id="edition-list" role={regions.length > 2 ? 'tabpanel' : undefined} className="list-none" aria-live="polite">
        {shown.map((s) => (
          <StoryItem
            key={s.id}
            story={s}
            rank={stories.indexOf(s) + 1}
            total={total}
            lead={stories.indexOf(s) === 0}
            tools={tools}
          />
        ))}
      </ol>

      {live && (
        <section aria-label="End of today's edition" className="mt-10 md:mt-12">
          <div className="grid gap-5 rounded-t-lg bg-surface-inverse p-6 text-text-inverse md:px-11 md:pb-10 md:pt-11">
            <EditionProgress
              total={total}
              done={readCount}
              inverse
              label={
                <span className="uppercase tracking-label">
                  {readCount} of {total} read
                </span>
              }
            />
            <h2 className="font-display text-display-l font-extrabold">
              {allRead ? 'You’re caught up.' : 'That’s the edition.'}
            </h2>
            <p className="max-w-[520px] text-pretty text-body-lg">
              {allRead
                ? 'That’s today’s edition. Go build something. '
                : `${left.length} ${left.length === 1 ? 'story' : 'stories'} still unread above. `}
              The next one lands at <EditionTime show="time" />.
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1 border-t-hairline border-ink-700 pt-5">
              <span className="font-mono text-label font-medium uppercase text-sand-300">Next edition</span>
              <span className="font-mono text-data-lg font-medium">
                {formatEditionDate(nextDate, false)} · <EditionTime />
              </span>
              <span className="text-sm text-sand-300">Your time, {marketName}</span>
            </div>
          </div>
          <div className="grid gap-4 border-x-hairline border-border-hairline bg-surface-raised p-6 md:px-11 md:py-8">
            <h3 className="font-display text-title-2 font-bold text-text-strong">
              Get The Signal in your inbox at <EditionTime />
            </h3>
            <NewsletterForm source="edition" />
          </div>
          <Link
            href={previous ? `/news/archive/${previous.date}` : '/news/archive'}
            className={`flex items-center justify-between gap-4 rounded-b-lg border-hairline border-border-hairline px-6 py-5 text-text-strong no-underline hover:bg-cream-300 md:px-11`}
          >
            <span>
              <b className="block font-display text-title-3 font-bold">{previous ? (previousIsYesterday ? 'Yesterday’s edition →' : 'Previous edition →') : 'Past editions →'}</b>
              {previous && (
                <span className="font-mono text-[12.5px] text-ink-700">
                  Edition #{previous.number} · {formatEditionDate(previous.date, false)} · {previous.count}{' '}
                  {previous.count === 1 ? 'story' : 'stories'}
                </span>
              )}
            </span>
          </Link>
        </section>
      )}
    </>
  )
}
