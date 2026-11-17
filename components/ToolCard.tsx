import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { Tag } from './Tag'
import { VerifiedBadge } from './VerifiedBadge'
import { SponsoredLabel } from './SponsoredLabel'
import { LocalFitMeter } from './LocalFitMeter'
import { Icon } from './Icon'

interface ToolCardProps {
  tool: Tool
  marketId: string
  marketName: string
  sponsored?: boolean
  saved?: boolean
  onToggleSave?: () => void
  comparing?: boolean
  compareDisabled?: boolean
  onToggleCompare?: () => void
}

export function ToolCard({
  tool,
  marketId,
  marketName,
  sponsored = false,
  saved,
  onToggleSave,
  comparing,
  compareDisabled,
  onToggleCompare,
}: ToolCardProps) {
  const fit = computeLocalFit(tool, marketId, marketName)
  const showActions = onToggleSave || onToggleCompare
  return (
    <article
      className={`flex h-full flex-col gap-3.5 rounded-lg border-hairline bg-surface-raised p-5 ${
        sponsored ? 'border-dashed border-border-strong' : 'border-border-hairline'
      }`}
    >
      {sponsored && <SponsoredLabel compact />}
      <Link href={`/tools/${tool.slug}`} className="flex flex-1 flex-col gap-3.5 text-inherit no-underline">
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
      {showActions && (
        <div className="grid grid-cols-2 gap-2">
          {onToggleSave && (
            <button
              type="button"
              aria-pressed={saved}
              onClick={onToggleSave}
              className="inline-flex min-h-hit-min items-center justify-center gap-1.5 rounded-pill border-thin border-border-strong text-[14px] font-semibold outline-none aria-pressed:bg-ink-900 aria-pressed:text-cream-200 aria-pressed:border-ink-900 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
            >
              <Icon name="bookmark" size={16} />
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
          {onToggleCompare && (
            <button
              type="button"
              aria-pressed={comparing}
              disabled={compareDisabled && !comparing}
              onClick={onToggleCompare}
              className="inline-flex min-h-hit-min items-center justify-center gap-1.5 rounded-pill border-thin border-border-strong text-[14px] font-semibold outline-none aria-pressed:bg-ink-900 aria-pressed:text-cream-200 aria-pressed:border-ink-900 disabled:cursor-not-allowed disabled:text-ink-600 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
            >
              <Icon name={comparing ? 'check' : 'plus'} size={16} />
              Compare
            </button>
          )}
        </div>
      )}
    </article>
  )
}
