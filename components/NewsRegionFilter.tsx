'use client'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

interface Props {
  regions: string[]
  currentRegion?: string
}

const PILL = 'pill border text-sm sm:text-xs transition-colors whitespace-nowrap min-h-[44px] inline-flex items-center'
const ACTIVE = 'bg-[#0D0D0D] text-[#F0EDE6] border-[#0D0D0D]'
const INACTIVE = 'bg-transparent text-[#0D0D0D] border-black/20 hover:border-black/60'

export default function NewsRegionFilter({ regions, currentRegion }: Props) {
  return (
    <>
      <a
        href="/news"
        className={`${PILL} ${!currentRegion ? ACTIVE : INACTIVE}`}
        onClick={() => window.posthog?.capture('news_filter_change', { region: 'all' })}
      >
        All
      </a>
      {regions.map((r) => (
        <a
          key={r}
          href={`/news?region=${encodeURIComponent(r)}`}
          className={`${PILL} ${currentRegion === r ? ACTIVE : INACTIVE}`}
          onClick={() => window.posthog?.capture('news_filter_change', { region: r })}
        >
          {r}
        </a>
      ))}
    </>
  )
}
