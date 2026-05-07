import { Suspense } from 'react'
import ToolCard from '@/components/ToolCard'
import ToolFilter from '@/components/ToolFilter'
import ToolSearch from '@/components/ToolSearch'
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS } from '@/lib/data'
import type { Tool } from '@/types'

interface Props {
  searchParams: { category?: string; price?: string }
}

async function getTools(category?: string, price?: string): Promise<Tool[]> {
  // Try Supabase first; fall back to local seed data when not configured
  if (supabase) {
    let query = supabase.from('tools').select('*').order('created_at', { ascending: false })
    if (category) query = query.eq('category', category)
    if (price)    query = query.eq('price_type', price)

    const { data, error } = await query
    if (!error && data) return data as Tool[]
  }

  // Seed data fallback with same filters
  let tools = SEED_TOOLS
  if (category) tools = tools.filter((t) => t.category === category)
  if (price)    tools = tools.filter((t) => t.price_type === price)
  return tools
}

export default async function ToolsPage({ searchParams }: Props) {
  const { category, price } = searchParams
  const tools = await getTools(category, price)

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      {/* ── Page header ───────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-4xl font-bold tracking-tight text-[#0D0D0D]">
            AI Tools Directory
          </h1>
          <span className="text-xs px-3 py-1 rounded-full border border-black/10 text-[#6B6560] font-medium">
            {tools.length} tools
          </span>
        </div>
        <p className="text-[#6B6560] text-base mt-2">
          The best AI tools for India and Southeast Asia
        </p>
        {(category || price) && (
          <a
            href="/tools"
            className="mt-2 inline-block text-xs font-medium text-[#6B6560] underline underline-offset-2 hover:text-[#0D0D0D] transition-colors"
          >
            Clear filters
          </a>
        )}
      </div>

      {/* ── Search ────────────────────────────────────── */}
      <div className="mb-4">
        <ToolSearch />
      </div>

      {/* ── Filter bar ────────────────────────────────── */}
      <div className="mb-8 pb-6 border-b border-black/[0.08]">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-cream-dark" />}>
          <ToolFilter />
        </Suspense>
      </div>

      {/* ── Tool grid ─────────────────────────────────── */}
      {tools.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted">No tools found for those filters.</p>
          <a href="/tools" className="mt-3 inline-block text-sm font-medium underline underline-offset-2">
            Reset filters
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}
