'use client'

import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { priceLabel } from '@/lib/utils'
import { formatEditionDate } from '@/lib/edition'
import { track } from '@/lib/analytics'
import { useMarket } from '../MarketProvider'
import { LocalFitMeter } from '../LocalFitMeter'

export interface PastEdition {
  date: string
  number: number
  count: number
  lead: string
}

interface NewsRailProps {
  tools: Tool[]
  toolsTitle: string
  past: PastEdition[]
}

const H2 = 'border-b-hairline border-border-strong pb-2.5 font-display text-title-3 font-bold text-text-strong'

export function NewsRail({ tools, toolsTitle, past }: NewsRailProps) {
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]

  return (
    <aside className="grid content-start gap-9 pt-8 md:sticky md:top-[68px]">
      {tools.length > 0 && (
        <div>
          <h2 className={H2}>{toolsTitle}</h2>
          {tools.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              onClick={() => track('news_to_tool_click', { slug: t.slug, source: 'edition_rail' })}
              className="group grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b-hairline border-border-hairline py-3.5 text-inherit no-underline"
            >
              <span
                aria-hidden="true"
                className="row-span-2 flex h-10 w-10 items-center justify-center rounded-md bg-surface-inset font-display text-base font-extrabold text-ink-700"
              >
                {t.name.charAt(0)}
              </span>
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display font-bold text-text-strong group-hover:underline">{t.name}</span>
                <span className="whitespace-nowrap font-mono text-[12.5px] text-ink-700">{priceLabel(t)}</span>
              </span>
              <LocalFitMeter fit={computeLocalFit(t, current.id, current.name)} showLabel={false} />
            </Link>
          ))}
          {current.id !== 'in' && (
            <p className="mt-2.5 text-body-sm text-text-muted">Scored and priced for India until we cover {current.name}.</p>
          )}
        </div>
      )}
      <div>
        <h2 className={H2}>Past editions</h2>
        {past.length === 0 ? (
          <p className="py-3.5 text-body-sm text-text-muted">No past editions yet. The archive starts with the first one.</p>
        ) : (
          past.map((p) => (
            <Link
              key={p.date}
              href={`/news/archive/${p.date}`}
              className="group grid gap-0.5 border-b-hairline border-border-hairline py-3.5 text-inherit no-underline"
            >
              <span className="font-mono text-data-sm uppercase tracking-[0.04em] text-ink-700">
                Edition #{p.number} · {formatEditionDate(p.date, false)} · {p.count} {p.count === 1 ? 'story' : 'stories'}
              </span>
              <b className="text-[15px] font-semibold leading-snug group-hover:underline">{p.lead}</b>
            </Link>
          ))
        )}
        <Link href="/news/archive" className="inline-flex min-h-hit-min items-center text-sm font-semibold text-text-link hover:text-text-link-hover">
          All editions →
        </Link>
      </div>
    </aside>
  )
}
