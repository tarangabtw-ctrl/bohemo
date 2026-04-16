import Link from 'next/link'
import type { Tool } from '@/types'

const CATEGORY_COLOURS: Record<string, string> = {
  Writing:     'bg-blue-50   text-blue-700  border-blue-200',
  Code:        'bg-violet-50 text-violet-700 border-violet-200',
  Design:      'bg-pink-50   text-pink-700   border-pink-200',
  Video:       'bg-orange-50 text-orange-700 border-orange-200',
  Research:    'bg-teal-50   text-teal-700   border-teal-200',
  Productivity:'bg-yellow-50 text-yellow-700 border-yellow-200',
  Marketing:   'bg-rose-50   text-rose-700   border-rose-200',
}

const PRICE_COLOURS: Record<string, string> = {
  free:          'bg-emerald-50 text-emerald-700 border-emerald-200',
  freemium:      'bg-sky-50     text-sky-700     border-sky-200',
  paid:          'bg-[#E3DFD7] text-secondary   border-[rgba(13,13,13,0.15)]',
  'open-source': 'bg-lime-50   text-lime-700    border-lime-200',
}

interface Props {
  tool: Tool
}

export default function ToolCard({ tool }: Props) {
  const categoryStyle = CATEGORY_COLOURS[tool.category] ?? 'bg-[#E3DFD7] text-secondary border-[rgba(13,13,13,0.15)]'
  const priceStyle    = PRICE_COLOURS[tool.price_type]   ?? 'bg-[#E3DFD7] text-secondary border-[rgba(13,13,13,0.15)]'

  return (
    <Link href={`/tools/${tool.slug}`} className="group block">
      <article className="card-hover h-full flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`pill border text-xs ${categoryStyle}`}>
              {tool.category}
            </span>
            <span className={`pill border text-xs ${priceStyle}`}>
              {tool.price_label ?? tool.price_type}
            </span>
          </div>
          {tool.verified && (
            <span
              title="Bohemo Verified"
              className="flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-cream shrink-0"
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* Tool name */}
        <h3 className="font-semibold text-base text-ink leading-snug group-hover:underline decoration-1 underline-offset-2">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed line-clamp-3 flex-1">
          {tool.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="pill-filled text-[11px]">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-muted group-hover:text-ink transition-colors">
            Visit →
          </span>
        </div>
      </article>
    </Link>
  )
}
