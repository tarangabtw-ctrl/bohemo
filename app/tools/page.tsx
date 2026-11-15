import Link from 'next/link'
import { getTools } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { TOOL_CATEGORIES, PRICE_TYPES } from '@/types'

// v2 teardown stub: data and filters wired, no design.
export const metadata = buildMetadata({
  title: 'AI Tools Directory — bohemo.',
  description: 'The best AI tools for India and Southeast Asia, curated by category, use case, and price.',
  path: '/tools',
})

interface Props {
  searchParams: { category?: string; price?: string }
}

export default async function ToolsPage({ searchParams }: Props) {
  const { category, price } = searchParams
  const tools = await getTools(category, price)

  return (
    <>
      <h1>AI Tools Directory ({tools.length})</h1>

      <p>
        Category: <Link href="/tools">All</Link>
        {TOOL_CATEGORIES.map((c) => (
          <span key={c}>
            {' · '}
            <Link href={`/tools?category=${encodeURIComponent(c)}`}>{c}</Link>
          </span>
        ))}
      </p>
      <p>
        Price:
        {PRICE_TYPES.map((p) => (
          <span key={p.value}>
            {' · '}
            <Link href={`/tools?price=${p.value}`}>{p.label}</Link>
          </span>
        ))}
      </p>

      {tools.length > 0 ? (
        <ul>
          {tools.map((t) => (
            <li key={t.id}>
              <Link href={`/tools/${t.slug}`}>{t.name}</Link> — {t.category} — {t.price_label ?? t.price_type}
              {t.verified ? ' — verified' : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tools match these filters.</p>
      )}
    </>
  )
}
