'use client'

import Link from 'next/link'
import type { NewsArticle, Tool } from '@/types'
import { MARKETS } from '@/lib/markets'
import { formatDate } from '@/lib/utils'
import { pad2, readMinutes } from '@/lib/edition'
import { useSavedStories, useReadStories } from '@/lib/savedAndCompare'
import { useMarket } from '../MarketProvider'
import { Tag } from '../Tag'
import { Icon } from '../Icon'

interface StoryItemProps {
  story: NewsArticle
  /** 1-based position in the edition; omit for stories outside an edition. */
  rank?: number
  total?: number
  lead?: boolean
  tools: Tool[]
}

export function StoryItem({ story, rank, total, lead = false, tools }: StoryItemProps) {
  const { market } = useMarket()
  const marketName = (MARKETS.find((m) => m.id === market) ?? MARKETS[0]).name
  const { isSaved, toggle } = useSavedStories()
  const { isRead } = useReadStories()
  const saved = isSaved(story.id)
  const read = isRead(story.id)
  const storyTools = story.tools_mentioned
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is Tool => Boolean(t))
  const number = rank ? (
    <span className="font-mono text-sm font-semibold leading-[26px]" aria-label={total ? `Story ${rank} of ${total}` : `Story ${rank}`}>
      {pad2(rank)}
    </span>
  ) : null

  return (
    <li className={`grid border-b-hairline border-border-hairline py-6 md:py-8 ${rank ? 'md:grid-cols-[56px_minmax(0,1fr)]' : ''}`}>
      {number && <div className="hidden md:block">{number}</div>}
      <article className="grid gap-3">
        <div className="flex min-h-[26px] flex-wrap items-center gap-2.5">
          {number && <span className="md:hidden">{number}</span>}
          {story.region && (
            <Tag variant="brown" size="sm">
              {story.region}
            </Tag>
          )}
          <span className="font-mono text-data-sm uppercase tracking-[0.04em] text-ink-700">
            {story.source} · {formatDate(story.published_at)}
          </span>
          {read && (
            <span className="ml-auto inline-flex items-center gap-1 font-mono text-data-sm uppercase tracking-[0.04em] text-ink-700">
              <Icon name="check" size={14} />
              Read
            </span>
          )}
        </div>
        <h2
          className={`text-pretty font-display text-text-strong ${
            lead ? 'text-display-m font-extrabold' : 'text-title-1 font-bold'
          }`}
        >
          <Link href={`/news/${story.id}`} className="text-inherit no-underline decoration-2 underline-offset-4 hover:underline">
            {story.title}
          </Link>
        </h2>
        {story.excerpt && <p className="text-pretty text-[17px] leading-relaxed text-ink-700">{story.excerpt}</p>}
        {story.why_it_matters && (
          <p className="text-pretty text-body font-semibold text-text-strong">
            <b className="mb-1 block font-mono text-[11.5px] font-medium uppercase tracking-label">
              Why it matters{story.region === marketName ? ` for ${marketName}` : ''}
            </b>
            {story.why_it_matters}
          </p>
        )}
        <div className="flex min-h-hit-min flex-wrap items-center gap-3">
          {storyTools.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-label font-medium uppercase text-text-muted">Tools</span>
              {storyTools.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="inline-flex min-h-hit-min items-center"
                >
                  <span className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-pill border-hairline border-border-strong pl-1 pr-3 text-[13.5px] font-semibold text-text-strong hover:border-ink-900">
                    <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-fill-tag-brown font-display text-xs">
                      {t.name.charAt(0)}
                    </span>
                    {t.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="whitespace-nowrap font-mono text-[12.5px] text-ink-700">{readMinutes(story)} min read</span>
            <button
              type="button"
              aria-pressed={saved}
              aria-label={`${saved ? 'Saved' : 'Save'}: ${story.title}`}
              onClick={() => toggle(story.id)}
              className="-mr-3 grid h-hit-min w-hit-min place-items-center rounded-full text-text-strong outline-none hover:bg-cream-300 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
            >
              <Icon name="bookmark" size={20} className={saved ? '[&_path]:fill-current' : ''} />
            </button>
          </div>
        </div>
      </article>
    </li>
  )
}
