import Link from 'next/link'
import { getNews } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

// v2 teardown stub: data and region filter wired, no design.
export const metadata = buildMetadata({
  title: 'AI News — Bohemo',
  description: "What's happening in AI across India and Southeast Asia.",
  path: '/news',
})

const REGIONS = ['India', 'Southeast Asia', 'Singapore', 'Indonesia']

interface Props {
  searchParams: { region?: string }
}

export default async function NewsPage({ searchParams }: Props) {
  const articles = await getNews(searchParams.region)

  return (
    <>
      <h1>AI News</h1>
      <p>
        Region: <Link href="/news">All</Link>
        {REGIONS.map((r) => (
          <span key={r}>
            {' · '}
            <Link href={`/news?region=${encodeURIComponent(r)}`}>{r}</Link>
          </span>
        ))}
      </p>

      {articles.length > 0 ? (
        <ul>
          {articles.map((a) => (
            <li key={a.id}>
              <Link href={`/news/${a.id}`}>{a.title}</Link> — {a.source} — {a.region}
            </li>
          ))}
        </ul>
      ) : (
        <p>No stories yet.</p>
      )}
    </>
  )
}
