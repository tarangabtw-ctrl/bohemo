import type { Metadata } from 'next'
import Link from 'next/link'
import { EditionTime } from '@/components/news/EditionTime'
import { SearchLauncher } from '@/components/states/SearchLauncher'

export const metadata: Metadata = {
  title: 'Page not found — Bohemo',
  robots: { index: false, follow: true },
}

const PILL = 'h-[22px] flex-1 rounded-pill border-thick border-dashed border-border-strong'
const DOT = 'h-[22px] w-[22px] shrink-0 rounded-full border-thick border-dashed border-border-strong'

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-container justify-items-center gap-2.5 px-4 pb-14 pt-12 text-center md:gap-3 md:px-6 md:pb-24 md:pt-[88px]">
      <div className="mb-3 grid w-[120px] gap-2" aria-hidden="true">
        <div className="flex gap-2">
          <span className={PILL} />
          <span className={DOT} />
        </div>
        <div className="flex gap-2">
          <span className={PILL} />
        </div>
        <div className="flex gap-2">
          <span className={DOT} />
          <span className={PILL} />
        </div>
      </div>
      <p className="font-mono text-label font-medium uppercase text-text-muted">404 · page not found</p>
      <h1 className="text-balance font-display text-display-xl font-extrabold text-text-strong">Lost in translation.</h1>
      <p className="text-lg leading-[1.45] text-ink-700 md:text-[21px]">Which is exactly what we’re here to fix.</p>
      <div className="mt-4 w-full max-w-[560px] md:mt-5">
        <SearchLauncher />
      </div>
      <div className="mt-1 flex flex-col items-center md:flex-row md:gap-3">
        <Link href="/news" className="inline-flex min-h-hit-min items-center text-[15px] font-semibold text-text-strong no-underline hover:underline">
          Read today’s edition →
        </Link>
        <span className="font-mono text-[12.5px] text-ink-700">
          Lands at <EditionTime />
        </span>
      </div>
    </div>
  )
}
