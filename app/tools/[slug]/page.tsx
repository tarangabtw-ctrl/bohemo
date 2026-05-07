import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS } from '@/lib/data'
import type { Tool } from '@/types'
import type { Metadata } from 'next'
import ToolPageClient from '@/components/ToolPageClient'

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

export default async function ToolPage({ params }: Props) {
  const tool = await getTool(params.slug)
  if (!tool) notFound()

  // All UI (including tool_viewed + tool_clicked events) lives in the
  // client component — this server component exists only to fetch data.
  return <ToolPageClient tool={tool} />
}
