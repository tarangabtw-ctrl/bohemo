import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTool, getSimilarTools } from '@/lib/queries'
import { SEED_TOOLS } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import { PRICE_TYPES } from '@/types'

// v2 teardown stub: data wired, no design.
interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getTool(params.slug)
  if (!tool) return { title: 'Tool not found — Bohemo' }
  return buildMetadata({ title: `${tool.name} — Bohemo`, description: tool.description, path: `/tools/${tool.slug}` })
}

export async function generateStaticParams() {
  return SEED_TOOLS.map((tool) => ({ slug: tool.slug }))
}

export default async function ToolPage({ params }: Props) {
  const tool = await getTool(params.slug)
  if (!tool) notFound()

  const similar = await getSimilarTools(tool.category, tool.slug)
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <p>
        <Link href="/tools">← All tools</Link>
      </p>
      <h1>{tool.name}</h1>
      <p>{tool.description}</p>
      <ul>
        <li>Category: {tool.category}</li>
        <li>Price: {priceLabel}</li>
        <li>Regions: {tool.region_relevance.join(', ') || '—'}</li>
        <li>Tags: {tool.tags.join(', ') || '—'}</li>
        <li>Verified: {tool.verified ? 'Yes' : 'No'}</li>
      </ul>
      <p>
        <a href={tool.url} target="_blank" rel="noopener noreferrer">
          Visit {tool.name}
        </a>
      </p>

      <h2>Similar tools</h2>
      {similar.length > 0 ? (
        <ul>
          {similar.map((t) => (
            <li key={t.id}>
              <Link href={`/tools/${t.slug}`}>{t.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No similar tools yet.</p>
      )}
    </>
  )
}
