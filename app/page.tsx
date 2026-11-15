import Link from 'next/link'
import { NewsletterForm } from '@/components/NewsletterForm'
import { getToolOfWeek, getLatestNews } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'

// v2 teardown stub: data wired, no design.
const TITLE = 'bohemo. — AI tools & news for India and Southeast Asia'
const DESCRIPTION =
  'Discover the best AI tools and stay up to date with AI news — curated for India and Southeast Asia.'

export const metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: '/' })

const schemas = [
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'bohemo.', url: SITE_URL, description: DESCRIPTION },
  { '@context': 'https://schema.org', '@type': 'Organization', name: 'bohemo.', url: SITE_URL, description: DESCRIPTION },
]

export default async function HomePage() {
  const [tool, news] = await Promise.all([getToolOfWeek(), getLatestNews()])

  return (
    <>
      {schemas.map((s) => (
        <script key={s['@type']} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <h1>bohemo.</h1>
      <p>{DESCRIPTION}</p>

      <section>
        <h2>Tool of the week</h2>
        {tool ? (
          <p>
            <Link href={`/tools/${tool.slug}`}>{tool.name}</Link> — {tool.description}
          </p>
        ) : (
          <p>No tools yet.</p>
        )}
      </section>

      <section>
        <h2>Latest news</h2>
        {news.length > 0 ? (
          <ul>
            {news.map((n) => (
              <li key={n.id}>
                <Link href={`/news/${n.id}`}>{n.title}</Link> — {n.source}
              </li>
            ))}
          </ul>
        ) : (
          <p>No news yet.</p>
        )}
      </section>

      <section>
        <h2>Newsletter</h2>
        <NewsletterForm />
      </section>
    </>
  )
}
