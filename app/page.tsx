import Link from 'next/link'
import { getTools, getTrendingTools, getLatestEditionDate, getEditionStories, getLatestNews } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ToolCard } from '@/components/ToolCard'
import { NewsCard } from '@/components/NewsCard'
import { EmptyState } from '@/components/EmptyState'
import { Pulse } from '@/components/home/Pulse'
import { HeroSearch } from '@/components/home/HeroSearch'

// Tools, news and the daily edition change at runtime — without this, Next
// statically prerenders Home at build time and never picks up new rows.
export const revalidate = 60

const TITLE = 'Bohemo — AI tools & news for India and Southeast Asia'
const DESCRIPTION =
  'Discover the best AI tools and stay up to date with AI news — curated for India and Southeast Asia.'

export const metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: '/' })

const schemas = [
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Bohemo', url: SITE_URL, description: DESCRIPTION },
  { '@context': 'https://schema.org', '@type': 'Organization', name: 'Bohemo', url: SITE_URL, description: DESCRIPTION },
]

export default async function HomePage() {
  const [tools, trending, pulseItems, editionDate] = await Promise.all([
    getTools(),
    getTrendingTools(6),
    getLatestNews(8),
    getLatestEditionDate(),
  ])
  const editionStories = editionDate ? await getEditionStories(editionDate) : []

  return (
    <>
      {schemas.map((s) => (
        <script key={s['@type']} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <Pulse items={pulseItems} />
      <HeroSearch tools={tools} />

      {/* Today's edition */}
      <section className="border-t-heavy border-border-ink py-8 md:py-11">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 md:mb-6">
            <h2 className="text-title-1 font-bold text-text-strong">The Signal — today&apos;s edition</h2>
            <Link href="/news" className="text-sm font-semibold text-text-link no-underline hover:underline">
              Read today&apos;s edition →
            </Link>
          </div>
          {editionStories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3 md:gap-0">
              {editionStories.slice(0, 3).map((story, i) => (
                <div
                  key={story.id}
                  className={`flex flex-col gap-3 md:px-7 ${i > 0 ? 'border-t-hairline border-border-hairline pt-5 md:border-l-hairline md:border-t-0 md:pl-7 md:pt-0' : ''} ${
                    i === 0 ? 'md:pl-0' : ''
                  } ${i === editionStories.slice(0, 3).length - 1 ? 'md:pr-0' : ''}`}
                >
                  <NewsCard article={story} variant={i === 0 ? 'lead' : 'standard'} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState kind="empty" title="No edition yet." body="The Signal lands at 8:00 IST once there's a story to tell." actionHref="/news" actionLabel="Browse all news" />
          )}
        </div>
      </section>

      {/* Trending tools */}
      <section className="border-t-hairline border-border-hairline py-8 md:py-11">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 md:mb-6">
            <h2 className="text-title-1 font-bold text-text-strong">Trending tools</h2>
            <Link href="/tools" className="text-sm font-semibold text-text-link no-underline hover:underline">
              Browse all tools →
            </Link>
          </div>
          {trending.length > 0 ? (
            <div className="-mr-4 flex gap-3 overflow-x-auto pb-1 pr-4 md:-mr-6 md:gap-4 md:pr-6" style={{ scrollbarWidth: 'none' }}>
              {trending.map((tool) => (
                <div key={tool.id} className="w-[280px] shrink-0 md:w-[288px]">
                  <ToolCard tool={tool} marketId="in" marketName="India" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState kind="empty" title="No tools yet." body="Nothing here until the directory has at least one tool." actionHref="/get-listed" actionLabel="Submit a tool" />
          )}
        </div>
      </section>

      {/* How we rate */}
      <section className="border-t-hairline border-border-hairline py-8 md:py-11">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <div className="rounded-lg border-thin border-border-ink bg-surface-raised p-6 md:p-9">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-hairline border-border-hairline pb-5">
              <div>
                <p className="font-mono text-label font-medium uppercase tracking-label text-text-muted">Standards</p>
                <h2 className="mt-1.5 text-title-1 font-bold text-text-strong">Local Fit, not a popularity contest.</h2>
              </div>
              <Link href="/how-we-rate" className="text-sm font-semibold text-text-link no-underline hover:underline">
                Read how we rate →
              </Link>
            </div>
            <ul className="mt-5 grid gap-3 text-[15px] text-ink-700 md:grid-cols-2">
              <li>Languages, local payment methods and local pricing — checked, not assumed.</li>
              <li>Works on low bandwidth — checked against real conditions, not specs.</li>
              <li>Data stored in your market — matched against where you are, not a global yes or no.</li>
              <li>NULL means we haven&apos;t checked yet. We say so, instead of guessing.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t-hairline border-border-hairline py-8 md:py-11">
        <div className="mx-auto grid max-w-container gap-6 px-4 md:grid-cols-2 md:gap-16 md:px-6">
          <div>
            <p className="font-mono text-label font-medium uppercase tracking-label text-text-muted">The Signal</p>
            <h2 className="mt-1.5 text-title-1 font-bold text-text-strong">7 stories. One read time. 8:00 every morning.</h2>
            <p className="mt-3 text-[15px] text-ink-700">AI news for India and Southeast Asia, in your inbox before your first meeting.</p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <NewsletterForm />
            <p className="text-[13px] text-text-muted">No spam. Unsubscribe any time.</p>
          </div>
        </div>
      </section>

      {/* Founding members */}
      <section className="border-t-hairline border-border-hairline py-8 md:py-11">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <div className="flex flex-col items-start gap-6 rounded-xl bg-surface-inverse p-7 text-cream-200 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <p className="font-mono text-label font-medium uppercase tracking-label text-sand-400">Bohemo Pro</p>
              <h2 className="mt-2.5 text-title-1 font-bold text-cream-200">Founding members keep this price for life.</h2>
              <p className="mt-3 max-w-[480px] text-[15px] text-sand-400">
                The first 500 Pro members keep this price for life. Get Pro while founding pricing lasts.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex min-h-hit-min shrink-0 items-center rounded-pill bg-cream-200 px-7 font-body text-[15px] font-semibold text-ink-900 no-underline transition-colors duration-fast hover:bg-paper-0"
            >
              Get Pro
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
