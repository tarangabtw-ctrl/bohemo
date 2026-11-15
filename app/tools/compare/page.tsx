import Link from 'next/link'
import { getToolsBySlug } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { PRICE_TYPES } from '@/types'

// v2 teardown stub: data wired, no design. Usage: /tools/compare?tools=a,b,c
export const metadata = buildMetadata({
  title: 'Compare AI tools — bohemo.',
  description:
    'Compare AI tools side by side — pricing, categories, tags, and regional relevance for India and Southeast Asia.',
  path: '/tools/compare',
})

interface Props {
  searchParams: { tools?: string }
}

export default async function ComparePage({ searchParams }: Props) {
  const slugs = (searchParams.tools ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
  const tools = await getToolsBySlug(slugs)

  if (tools.length < 2) {
    return (
      <>
        <h1>Compare tools</h1>
        <p>Pick 2 or 3 tools from the directory to compare.</p>
        <Link href="/tools">Browse tools</Link>
      </>
    )
  }

  return (
    <>
      <h1>Compare tools</h1>
      <table>
        <thead>
          <tr>
            <th />
            {tools.map((t) => (
              <th key={t.id}>
                <Link href={`/tools/${t.slug}`}>{t.name}</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Category</th>
            {tools.map((t) => <td key={t.id}>{t.category}</td>)}
          </tr>
          <tr>
            <th>Price</th>
            {tools.map((t) => (
              <td key={t.id}>{t.price_label ?? PRICE_TYPES.find((p) => p.value === t.price_type)?.label}</td>
            ))}
          </tr>
          <tr>
            <th>Regions</th>
            {tools.map((t) => <td key={t.id}>{t.region_relevance.join(', ')}</td>)}
          </tr>
          <tr>
            <th>Tags</th>
            {tools.map((t) => <td key={t.id}>{t.tags.join(', ')}</td>)}
          </tr>
        </tbody>
      </table>
    </>
  )
}
