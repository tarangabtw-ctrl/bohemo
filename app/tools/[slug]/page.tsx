import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS } from '@/lib/data'
import { SITE_URL } from '@/lib/site'
import type { Tool } from '@/types'
import { PRICE_TYPES } from '@/types'
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

async function getSimilarTools(category: string, slug: string): Promise<Tool[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('category', category)
      .neq('slug', slug)
      .limit(3)
    if (!error && data) return data as Tool[]
  }
  return SEED_TOOLS.filter((t) => t.category === category && t.slug !== slug).slice(0, 3)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getTool(params.slug)
  if (!tool) {
    return {
      title: 'Tool not found — bohemo.',
      description: 'This tool could not be found in the bohemo. directory.',
    }
  }

  const title = `${tool.name} — bohemo.`
  return {
    title,
    description: tool.description ?? undefined,
    openGraph: {
      title,
      description: tool.description ?? undefined,
      url: `${SITE_URL}/tools/${tool.slug}`,
      siteName: 'bohemo.',
      type: 'website',
    },
  }
}

export async function generateStaticParams() {
  return SEED_TOOLS.map((tool) => ({ slug: tool.slug }))
}

export default async function ToolPage({ params }: Props) {
  const tool = await getTool(params.slug)
  if (!tool) notFound()

  const similarTools = await getSimilarTools(tool.category, tool.slug)

  const priceLabel = tool.price_label ?? PRICE_TYPES.find((p) => p.value === tool.price_type)?.label ?? tool.price_type
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category,
    url: tool.url,
    offers: {
      '@type': 'Offer',
      category: priceLabel,
      ...(tool.price_type === 'free' ? { price: '0', priceCurrency: 'USD' } : {}),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* All UI (including tool_viewed + tool_clicked events) lives in the
          client component — this server component exists only to fetch data. */}
      <ToolPageClient tool={tool} similarTools={similarTools} />
    </>
  )
}
