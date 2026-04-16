import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS } from '@/lib/data'
import type { Tool } from '@/types'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

async function getTool(slug: string): Promise<Tool | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .single()
    if (!error && data) return data as Tool
  }
  return SEED_TOOLS.find((t) => t.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getTool(params.slug)
  if (!tool) return { title: 'Tool not found — bohemo.' }
  return {
    title: `${tool.name} — bohemo.`,
    description: tool.description ?? undefined,
  }
}

export async function generateStaticParams() {
  return SEED_TOOLS.map((tool) => ({ slug: tool.slug }))
}

const PRICE_LABELS: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
  'open-source': 'Open Source',
}

export default async function ToolPage({ params }: Props) {
  const tool = await getTool(params.slug)
  if (!tool) notFound()

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

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
        >
          Visit {tool.name} →
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(13,13,13,0.10)] my-8" />

      {/* Tags & regions */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => (
              <span key={tag} className="pill-filled">{tag}</span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Region relevance
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {tool.region_relevance.map((r) => (
              <span key={r} className="pill-outline">{r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(13,13,13,0.10)] my-8" />

      <Link
        href="/tools"
        className="text-sm text-muted underline underline-offset-2 hover:text-ink transition-colors"
      >
        Browse more tools
      </Link>
    </div>
  )
}
