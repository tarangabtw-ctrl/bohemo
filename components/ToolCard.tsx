import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { Tag } from './Tag'
import { VerifiedBadge } from './VerifiedBadge'
import { SponsoredLabel } from './SponsoredLabel'
import { LocalFitMeter } from './LocalFitMeter'

interface ToolCardProps {
  tool: Tool
  marketId: string
  marketName: string
  sponsored?: boolean
}

export function ToolCard({ tool, marketId, marketName, sponsored = false }: ToolCardProps) {
  const fit = computeLocalFit(tool, marketId, marketName)
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`flex h-full flex-col gap-3.5 rounded-lg border-hairline bg-surface-raised p-5 text-inherit no-underline transition-colors duration-fast hover:border-ink-900 ${
        sponsored ? 'border-dashed border-border-strong' : 'border-border-hairline'
      }`}
    >
      {sponsored && <SponsoredLabel compact />}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-inset font-display text-lg font-extrabold text-ink-700">
          {tool.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-bold leading-tight tracking-title text-text-strong">{tool.name}</div>
          <div className="mt-0.5 text-[13px] text-text-muted">{tool.category}</div>
        </div>
        {tool.verified_at && <VerifiedBadge />}
      </div>
      <p className="line-clamp-2 text-[14.5px] leading-snug text-ink-700">{tool.description}</p>
      <LocalFitMeter fit={fit} />
      <div className="flex flex-wrap items-center gap-2">
        {tool.made_in_asia && <Tag variant="brown">Made in Asia</Tag>}
        {tool.tags.slice(0, 3).map((t) => (
          <Tag key={t} size="sm" variant="outline">
            {t}
          </Tag>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t-hairline border-border-hairline pt-3.5">
        <span className="font-mono text-[13.5px] font-medium text-text-strong">{tool.price_label ?? tool.price_type}</span>
        <span className="text-[14px] font-semibold text-text-link">See the rating →</span>
      </div>
    </Link>
  )
}
