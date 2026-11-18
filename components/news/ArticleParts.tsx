'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { priceLabel } from '@/lib/utils'
import { pad2 } from '@/lib/edition'
import { track } from '@/lib/analytics'
import { useReadStories, useSavedStories } from '@/lib/savedAndCompare'
import { useMarket } from '../MarketProvider'
import { LocalFitMeter } from '../LocalFitMeter'
import { Icon } from '../Icon'

interface MarkReadProps {
  id: string
  /** Set when the story is part of an edition of The Signal. */
  editionDate?: string | null
  rank?: number | null
  /** Every story id in that edition, to know when the reader has finished it. */
  editionStoryIds?: string[]
}

const COMPLETED_KEY = 'bohemo:editions-completed'

function readCompleted(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(COMPLETED_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * Marks the story as read when the article opens, for The Signal's "3 of 7 read".
 * For edition stories it also sends edition_story_read, and edition_completed
 * the first time every story in that edition has been read on this device.
 */
export function MarkRead({ id, editionDate, rank, editionStoryIds }: MarkReadProps) {
  const { read, markRead } = useReadStories()
  useEffect(() => {
    markRead(id)
    if (editionDate) track('edition_story_read', { id, edition_date: editionDate, rank })
  }, [id, markRead, editionDate, rank])

  // `read` updates after markRead writes, so this sees the story just opened.
  useEffect(() => {
    if (!editionDate || !editionStoryIds || editionStoryIds.length === 0) return
    if (!editionStoryIds.every((sid) => read.includes(sid))) return
    const done = readCompleted()
    if (done.includes(editionDate)) return
    track('edition_completed', { edition_date: editionDate, stories: editionStoryIds.length })
    try {
      window.localStorage.setItem(COMPLETED_KEY, JSON.stringify([...done, editionDate].slice(-60)))
    } catch {
      // can't remember it: it may be sent again on a later visit
    }
  }, [read, editionDate, editionStoryIds])
  return null
}

export function SaveStoryButton({ id, title }: { id: string; title: string }) {
  const { isSaved, toggle } = useSavedStories()
  const saved = isSaved(id)
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? 'Saved' : 'Save'}: ${title}`}
      onClick={() => toggle(id)}
      className="-mr-3 grid h-hit-min w-hit-min shrink-0 place-items-center rounded-full text-text-strong outline-none hover:bg-cream-300 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
    >
      <Icon name="bookmark" size={20} className={saved ? '[&_path]:fill-current' : ''} />
    </button>
  )
}

export function WhyItMattersLabel({ region }: { region: string }) {
  const { market } = useMarket()
  const name = (MARKETS.find((m) => m.id === market) ?? MARKETS[0]).name
  return <>Why it matters{region === name ? ` for ${name}` : ''}</>
}

export function ArticleToolCards({ tools, storyId }: { tools: Tool[]; storyId: string }) {
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  return (
    <>
      {tools.map((t) => (
        <Link
          key={t.slug}
          href={`/tools/${t.slug}`}
          onClick={() => track('news_to_tool_click', { slug: t.slug, story_id: storyId, source: 'article' })}
          className="group grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5 text-inherit no-underline hover:border-ink-900 md:grid-cols-[56px_minmax(0,1fr)_auto] md:gap-5 md:px-6"
        >
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-inset font-display text-xl font-extrabold text-ink-700 md:h-14 md:w-14"
          >
            {t.name.charAt(0)}
          </span>
          <span className="grid min-w-0 gap-1.5">
            <span className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-title-3 font-bold text-text-strong group-hover:underline">{t.name}</span>
              <span className="whitespace-nowrap font-mono text-[12.5px] text-ink-700">{priceLabel(t)}</span>
            </span>
            <span className="line-clamp-2 text-pretty text-[15.5px] leading-snug text-ink-700">{t.description}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="font-mono text-label font-medium uppercase text-text-muted">Local Fit for {current.name}</span>
              <LocalFitMeter fit={computeLocalFit(t, current.id, current.name)} showLabel={false} />
            </span>
          </span>
          <span className="col-start-2 whitespace-nowrap text-[15px] font-semibold md:col-start-3">See {t.name} →</span>
        </Link>
      ))}
    </>
  )
}

interface TocStory {
  id: string
  title: string
}

/** The edition's contents in the article rail, with a tick on stories already read. */
export function EditionToc({ stories, currentId }: { stories: TocStory[]; currentId: string }) {
  const { isRead } = useReadStories()
  return (
    <ol className="mb-3 list-none">
      {stories.map((s, i) => {
        const current = s.id === currentId
        return (
          <li
            key={s.id}
            aria-current={current ? 'true' : undefined}
            className={`grid grid-cols-[28px_minmax(0,1fr)_14px] items-start gap-2 border-b-hairline border-border-hairline py-3 ${
              current ? 'text-text-strong' : 'text-ink-700'
            }`}
          >
            <span className="font-mono text-[12.5px] leading-[21px]">{pad2(i + 1)}</span>
            <Link href={`/news/${s.id}`} className={`text-[15px] leading-snug text-inherit no-underline hover:underline ${current ? 'font-bold' : ''}`}>
              {s.title}
            </Link>
            {!current && isRead(s.id) ? <Icon name="check" size={14} className="mt-1" label="Read" /> : <span />}
          </li>
        )
      })}
    </ol>
  )
}
