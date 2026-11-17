import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticle, getRelatedArticles } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'

// v2 teardown stub: data wired, no design.
interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.id)
  if (!article) return { title: 'Story not found — Bohemo' }
  return buildMetadata({
    title: `${article.title} — Bohemo`,
    description: article.excerpt,
    path: `/news/${article.id}`,
    type: 'article',
    publishedTime: article.published_at ?? undefined,
  })
}

export default async function NewsArticlePage({ params }: Props) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const related = await getRelatedArticles(article.region, article.id)
  const date = article.published_at ?? article.created_at

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url: `${SITE_URL}/news/${article.id}`,
    ...(article.published_at ? { datePublished: article.published_at } : {}),
    author: { '@type': 'Organization', name: article.source },
    publisher: { '@type': 'Organization', name: article.source },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <p>
        <Link href="/news">← All news</Link>
      </p>
      <h1>{article.title}</h1>
      <p>
        {article.source} — {article.region}
        {date ? ` — ${new Date(date).toLocaleDateString('en-GB')}` : ''}
      </p>
      <p>{article.excerpt}</p>
      {article.url && article.url !== '#' && (
        <p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read at {article.source}
          </a>
        </p>
      )}

      <h2>Related</h2>
      {related.length > 0 ? (
        <ul>
          {related.map((r) => (
            <li key={r.id}>
              <Link href={`/news/${r.id}`}>{r.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No related stories yet.</p>
      )}
    </>
  )
}
