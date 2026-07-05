'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { Tool } from '@/types'
import ToolCard from '@/components/ToolCard'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

const PRICE_LABELS: Record<string, string> = {
  free:          'Free',
  freemium:      'Freemium',
  paid:          'Paid',
  'open-source': 'Open Source',
}

interface Props {
  tool: Tool
  similarTools: Tool[]
}

export default function ToolPageClient({ tool, similarTools }: Props) {
  // tool_viewed — fires once on mount (empty dep array per spec)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    window.posthog?.capture('tool_viewed', {
      tool_name:     tool.name,
      tool_category: tool.category,
      tool_slug:     tool.slug,
      tool_pricing:  tool.price_type,
    })
  }, []) // intentionally empty — fire once on page load

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Back link */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-8"
      >
        ← Back to Tools
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill-filled">{tool.category}</span>
          <span className="pill-outline">
            {tool.price_label ?? PRICE_LABELS[tool.price_type]}
          </span>
          {tool.verified && (
            <span className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Bohemo Verified
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
          {tool.name}
        </h1>

        <p className="text-base text-secondary leading-relaxed">
          {tool.description}
        </p>

        {/* tool_clicked — source: detail_page */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
          onClick={() => {
            window.posthog?.capture('tool_clicked', {
              tool_name: tool.name,
              tool_url:  tool.url,
              source:    'detail_page',
            })
          }}
        >
          Visit {tool.name} →
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(13,13,13,0.10)] my-8" />

      {/* Tags & regions */}
      {((tool.tags?.length ?? 0) > 0 || (tool.region_relevance?.length ?? 0) > 0) && (
        <div className="grid sm:grid-cols-2 gap-6">
          {(tool.tags?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map((tag) => (
                  <span key={tag} className="pill-filled">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {(tool.region_relevance?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Relevant in:
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {tool.region_relevance.map((r) => (
                  <span key={r} className="pill-outline">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[rgba(13,13,13,0.10)] my-8" />

      <Link
        href="/tools"
        className="text-sm text-muted underline underline-offset-2 hover:text-ink transition-colors"
      >
        Browse more tools
      </Link>

      {/* Similar tools */}
      {similarTools.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
            Similar tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
