'use client'

import Link from 'next/link'
import type { Tool } from '@/types'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

// ── Badge styles ──────────────────────────────────────────────────────────────
const PRICE_BADGE: Record<string, string> = {
  free:          'bg-emerald-50 text-emerald-700 border border-emerald-200',
  freemium:      'bg-amber-50   text-amber-700   border border-amber-200',
  paid:          'bg-[#0D0D0D]  text-[#F0EDE6]   border-transparent',
  'open-source': 'bg-lime-50    text-lime-700    border border-lime-200',
}

const PRICE_LABEL: Record<string, string> = {
  free:          'Free',
  freemium:      'Freemium',
  paid:          'Paid',
  'open-source': 'Open Source',
}

interface Props {
  tool: Tool
  selectable?: boolean
  selected?: boolean
  selectionDisabled?: boolean
  onToggleSelect?: (slug: string) => void
}

export default function ToolCard({ tool, selectable, selected, selectionDisabled, onToggleSelect }: Props) {
  const priceStyle = PRICE_BADGE[tool.price_type] ?? 'bg-[#E3DFD7] text-[#3D3A35] border border-black/10'
  const priceLabel = tool.price_label ?? PRICE_LABEL[tool.price_type] ?? tool.price_type

  return (
    <div className="relative h-full">
      {selectable && (
        <label
          className="absolute top-1 right-1 z-10 flex items-center justify-center w-11 h-11"
          aria-label={`Select ${tool.name} to compare`}
        >
          <input
            type="checkbox"
            checked={!!selected}
            disabled={!selected && selectionDisabled}
            onChange={() => onToggleSelect?.(tool.slug)}
            className="w-5 h-5 accent-[#0D0D0D] disabled:opacity-40"
          />
        </label>
      )}
      <Link
        href={`/tools/${tool.slug}`}
        className="group block h-full"
        onClick={() => {
          window.posthog?.capture('tool_clicked', {
            tool_name: tool.name,
            tool_url:  tool.url,
            source:    'card',
          })
          window.posthog?.capture('tool_card_click', {
            tool_name: tool.name,
            category:  tool.category,
          })
        }}
      >
        <article className="bg-white rounded-2xl p-5 border border-black/[0.08] hover:border-black/20 hover:shadow-md transition-all duration-200 h-full flex flex-col">

        {/* ── Header: logo mark + name + category ─────── */}
        <div className="flex items-start gap-3">
          {/* Logo / initial fallback */}
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-lg bg-[#F0EDE6] flex items-center justify-center shrink-0 text-sm font-bold text-[#6B6560] select-none"
          >
            {tool.name.charAt(0).toUpperCase()}
          </div>

          {/* Name + category */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[#0D0D0D] leading-snug group-hover:underline decoration-1 underline-offset-2 truncate">
              {tool.name}
            </h3>
            <p className="text-sm sm:text-xs text-[#6B6560] mt-0.5">{tool.category}</p>
          </div>

          {/* Verified badge */}
          {tool.verified && (
            <span className="flex items-center gap-1 rounded-full bg-[#0D0D0D] px-2 py-0.5 text-sm sm:text-[10px] font-semibold text-[#F0EDE6] shrink-0">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* ── Description ─────────────────────────────── */}
        <p className="text-sm text-[#6B6560] leading-relaxed mt-3 line-clamp-2 flex-1">
          {tool.description}
        </p>

        {/* ── Footer: pricing badge + visit link ──────── */}
        <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between gap-2">
          <span className={`text-sm sm:text-xs font-medium px-2.5 py-0.5 rounded-full ${priceStyle}`}>
            {priceLabel}
          </span>
          <span className="text-sm sm:text-xs font-medium text-[#6B6560] group-hover:text-[#0D0D0D] transition-colors shrink-0">
            Visit →
          </span>
        </div>

        </article>
      </Link>
    </div>
  )
}
