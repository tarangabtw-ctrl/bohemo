'use client'

import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { priceLabel } from '@/lib/utils'
import { useCompareTray } from '@/lib/savedAndCompare'
import { useMarket } from '../MarketProvider'
import { LocalFitMeter } from '../LocalFitMeter'
import { Icon } from '../Icon'

interface ToolAlternativesProps {
  alternatives: Tool[]
}

export function ToolAlternatives({ alternatives }: ToolAlternativesProps) {
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  const { compare, isComparing, toggle, max } = useCompareTray()

  return (
    <section aria-labelledby="alts-heading" className="border-t-hairline border-border-hairline pb-7 pt-6 md:pb-9 md:pt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 md:mb-4 md:items-end">
        <h2 id="alts-heading" className="font-display text-title-1 font-bold text-text-strong">
          Alternatives
        </h2>
        {compare.length >= 2 && (
          <Link
            href={`/compare?tools=${compare.join(',')}`}
            className="inline-flex min-h-hit-min items-center text-sm font-semibold text-text-link hover:text-text-link-hover"
          >
            Compare {compare.length} of {max} →
          </Link>
        )}
      </div>
      {alternatives.length === 0 ? (
        <p className="text-body text-text-muted">We haven&apos;t listed another tool in this category yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {alternatives.map((alt) => {
            const fit = computeLocalFit(alt, current.id, current.name)
            const on = isComparing(alt.slug)
            return (
              <article key={alt.id} className="flex flex-col gap-3 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-inset font-display text-lg font-extrabold text-ink-700"
                  >
                    {alt.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/tools/${alt.slug}`}
                      className="font-display text-title-3 font-bold text-text-strong no-underline hover:underline"
                    >
                      {alt.name}
                    </Link>
                    <div className="text-[13px] text-text-muted">
                      {alt.category}
                      {alt.made_in_asia && ' · Made in Asia'}
                    </div>
                  </div>
                </div>
                <p className="line-clamp-3 flex-1 text-body-sm text-text-body">{alt.description}</p>
                <div className="grid gap-2 border-t-hairline border-border-hairline pt-3">
                  <LocalFitMeter fit={fit} showLabel={false} />
                  <span className="font-mono text-data font-medium text-text-strong">{priceLabel(alt)}</span>
                </div>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`Compare ${alt.name}`}
                  disabled={!on && compare.length >= max}
                  onClick={() => toggle(alt.slug)}
                  className="inline-flex min-h-hit-min items-center justify-center gap-1.5 rounded-pill border-thin border-border-strong text-sm font-semibold text-text-strong outline-none aria-pressed:border-ink-900 aria-pressed:bg-ink-900 aria-pressed:text-cream-200 disabled:cursor-not-allowed disabled:border-border-hairline disabled:text-ink-600 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
                >
                  <Icon name={on ? 'check' : 'plus'} size={16} />
                  Compare
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
