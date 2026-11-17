'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { NewsHeadline } from '@/lib/queries'

interface PulseProps {
  items: NewsHeadline[]
}

// Pulse ticker. Items come from the news table; hidden entirely when there's nothing to show.
export function Pulse({ items }: PulseProps) {
  const [paused, setPaused] = useState(false)
  if (items.length === 0) return null

  const row = (keySuffix: string) => (
    <div className="flex h-full items-center" aria-hidden={keySuffix === 'dup' || undefined}>
      {items.map((n) => (
        <Link
          key={`${n.id}-${keySuffix}`}
          href={`/news/${n.id}`}
          className="inline-flex items-center gap-2 whitespace-nowrap px-5 text-cream-200 no-underline hover:underline"
        >
          <span className="font-semibold text-paper-0">{n.source}</span>
          <span className="h-1 w-1 rounded-full bg-umber-600" />
          <span>{n.title}</span>
        </Link>
      ))}
    </div>
  )

  return (
    <div
      className="flex h-11 items-center bg-surface-inverse font-mono text-[13px] text-cream-200"
      role="region"
      aria-label="Pulse: recent AI news"
      data-paused={paused}
    >
      <span className="flex h-full shrink-0 items-center gap-2 border-r-hairline border-ink-700 px-6 pl-4 font-semibold tracking-label text-paper-0">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        PULSE
      </span>
      <div className="min-w-0 flex-1 overflow-hidden" tabIndex={0}>
        <div
          className={`flex w-max ${paused ? '' : 'animate-marquee motion-reduce:animate-none'}`}
          style={{ height: '100%' }}
        >
          {row('a')}
          {row('dup')}
        </div>
      </div>
      <div className="shrink-0 border-l-hairline border-ink-700">
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
          className="h-11 min-w-[76px] px-4 font-body font-medium text-cream-200 outline-none hover:bg-ink-700 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring-inverse focus-visible:outline-offset-[-2px]"
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  )
}
