'use client'

import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit, localFitNotes, FIT_STATUS_LABEL } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { useMarket } from '../MarketProvider'
import { Tag } from '../Tag'
import { ReportMistakeForm } from './ReportMistakeForm'

interface LocalFitBreakdownProps {
  tool: Tool
  lastChecked: string | null
}

export function LocalFitBreakdown({ tool, lastChecked }: LocalFitBreakdownProps) {
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  const fit = computeLocalFit(tool, current.id, current.name)
  const notes = localFitNotes(tool, current.id, current.name)

  return (
    <section aria-labelledby="fit-heading" className="border-t-heavy border-ink-900 pb-7 pt-6 md:pb-9 md:pt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 md:mb-4 md:items-end">
        <h2 id="fit-heading" className="font-display text-title-1 font-bold text-text-strong">
          Local Fit, point by point
        </h2>
        <Link href="/how-we-rate" className="inline-flex min-h-hit-min items-center text-sm font-semibold text-text-link hover:text-text-link-hover">
          How we rate →
        </Link>
      </div>
      <ol className="list-none">
        {fit.criteria.map((c, i) => (
          <li
            key={c.label}
            className={`grid grid-cols-[14px_minmax(0,1fr)] gap-x-3 gap-y-2 py-4 md:grid-cols-[14px_minmax(0,1fr)_auto] md:gap-4 ${
              i === 0 ? 'pt-1' : 'border-t-hairline border-border-hairline'
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 h-3.5 w-3.5 rounded-full border-thin ${c.status === 'pass' ? 'border-mark-filled bg-mark-filled' : 'border-mark-empty'}`}
            />
            <div>
              <p className="font-mono text-label font-medium uppercase text-text-strong">{c.label}</p>
              <p className="mt-1 text-body text-text-body">{notes[i]}</p>
            </div>
            <span className="col-start-2 justify-self-start md:col-start-3">
              <Tag size="sm" variant={c.status === 'pass' ? 'neutral' : 'outline'}>
                {FIT_STATUS_LABEL[c.status]}
              </Tag>
            </span>
          </li>
        ))}
      </ol>
      <ReportMistakeForm toolSlug={tool.slug} toolName={tool.name} lastChecked={lastChecked} />
    </section>
  )
}
