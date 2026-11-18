import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTool, getSimilarTools, getNewsForTool } from '@/lib/queries'
import { SEED_TOOLS } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import { formatDate, priceLabel } from '@/lib/utils'
import { PRICE_TYPES } from '@/types'
import { Tag } from '@/components/Tag'
import { Icon } from '@/components/Icon'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { ToolActions } from '@/components/tools/ToolActions'
import { TrackedLink } from '@/components/TrackedLink'
import { LocalFitBreakdown } from '@/components/tools/LocalFitBreakdown'
import { ToolAlternatives } from '@/components/tools/ToolAlternatives'
import { WatchTool } from '@/components/tools/WatchTool'

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

// Bohemo Verified checks the company's own claims. In-market checks live in Local Fit.
const VERIFIED_CHECKS = ['Real company', 'Accurate prices', 'Works as described', 'Real support contact', 'Data handling reviewed']

const SECTION = 'border-t-hairline border-border-hairline pb-7 pt-6 md:pb-9 md:pt-8'
const SECTION_HEAD = 'mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 md:mb-4 md:items-end'
const H2 = 'font-display text-title-1 font-bold text-text-strong'
const MORE = 'inline-flex min-h-hit-min items-center text-sm font-semibold text-text-link hover:text-text-link-hover'

export default async function ToolPage({ params }: Props) {
  const tool = await getTool(params.slug)
  if (!tool) notFound()

  const [similar, stories] = await Promise.all([getSimilarTools(tool.category, tool.slug), getNewsForTool(tool.slug)])
  const price = priceLabel(tool)
  const lastChecked = tool.last_checked ? formatDate(tool.last_checked) : null
  const localPrices = Object.entries(tool.local_pricing ?? {}).filter(
    (entry): entry is [string, string | number] => typeof entry[1] === 'string' || typeof entry[1] === 'number',
  )

  // "What changed" only lists things we have dates for.
  const changes = [
    tool.verified_at && { date: tool.verified_at, kind: 'Verified', text: 'Passed the Bohemo Verified review.' },
    tool.last_checked && { date: tool.last_checked, kind: 'Checked', text: 'Local Fit and pricing checked.' },
    { date: tool.created_at, kind: 'Listing', text: 'Added to Bohemo.' },
  ]
    .filter((c): c is { date: string; kind: string; text: string } => Boolean(c))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category,
    url: tool.url,
    offers: {
      '@type': 'Offer',
      category: price,
      ...(tool.price_type === 'free' ? { price: '0', priceCurrency: 'USD' } : {}),
    },
  }

  return (
    <div className="mx-auto max-w-container px-4 pb-24 md:px-6 md:pb-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mt-1 md:mt-4">
        <ol className="flex flex-wrap items-center gap-2 font-mono text-[13px] text-ink-700">
          <li>
            <Link href="/tools" className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline">
              Tools
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/tools?task=${encodeURIComponent(tool.category.toLowerCase())}`}
              className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline"
            >
              {tool.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-text-strong">
            {tool.name}
          </li>
        </ol>
      </nav>

      {/* Header + action card */}
      <section className="grid items-start gap-5 pb-7 pt-1 md:grid-cols-[minmax(0,1fr)_372px] md:gap-12 md:pb-11 md:pt-4">
        <div className="flex items-start gap-3.5 md:gap-6">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-surface-inset font-display text-2xl font-extrabold text-ink-700 md:h-[88px] md:w-[88px] md:rounded-lg md:text-4xl"
          >
            {tool.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-display-l font-extrabold text-text-strong">{tool.name}</h1>
            <p className="mt-2 max-w-[620px] text-body-lg text-ink-700 md:mt-3">{tool.description}</p>
            <div className="mt-3.5 flex flex-wrap gap-2 md:mt-[18px]">
              <Tag>{tool.category}</Tag>
              {tool.made_in_asia && <Tag variant="brown">Made in Asia</Tag>}
              {tool.verified_at ? <VerifiedBadge /> : <Tag variant="outline">Not yet Bohemo Verified</Tag>}
            </div>
          </div>
        </div>
        <ToolActions tool={tool} />
      </section>

      <div className="grid items-start md:grid-cols-[minmax(0,1fr)_372px] md:gap-12">
        <div className="min-w-0">
          <LocalFitBreakdown tool={tool} lastChecked={lastChecked} />

          <section aria-labelledby="pricing-heading" className={SECTION}>
            <div className={SECTION_HEAD}>
              <h2 id="pricing-heading" className={H2}>
                Pricing
              </h2>
              <p className="font-mono text-label font-medium uppercase text-text-muted">
                {lastChecked ? `Last checked ${lastChecked}` : 'Not checked yet'}
              </p>
            </div>
            <ul className="list-none">
              <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 pb-4 pt-1 md:grid-cols-[150px_minmax(0,1fr)_auto] md:gap-4">
                <p className="font-semibold text-text-strong">Price</p>
                <p className="col-start-1 row-start-2 text-body-sm text-ink-700 md:col-start-2 md:row-start-1">
                  {PRICE_TYPES.find((p) => p.value === tool.price_type)?.label}
                </p>
                <p className="col-start-2 row-span-2 row-start-1 self-center text-right font-mono text-data-lg font-medium md:col-start-3 md:row-span-1">
                  {price}
                </p>
              </li>
              {localPrices.map(([currency, value]) => (
                <li
                  key={currency}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-t-hairline border-border-hairline py-4 md:grid-cols-[150px_minmax(0,1fr)_auto] md:gap-4"
                >
                  <p className="font-semibold text-text-strong">{currency}</p>
                  <span className="hidden md:block" />
                  <p className="text-right font-mono text-data-lg font-medium">{String(value)}</p>
                </li>
              ))}
            </ul>
            <p className="border-t-hairline border-border-hairline pt-3.5 font-mono text-data-sm leading-relaxed text-ink-700">
              {localPrices.length > 0
                ? `Local prices: ${localPrices.map(([c]) => c).join(', ')}`
                : 'Local-currency prices not checked yet'}
              {' · '}
              {tool.payment_methods && tool.payment_methods.length > 0
                ? `pays with ${tool.payment_methods.join(', ')}`
                : 'payment methods not confirmed'}
            </p>
          </section>

          <ToolAlternatives alternatives={similar} />

          <section aria-labelledby="news-heading" className={SECTION}>
            <div className={SECTION_HEAD}>
              <h2 id="news-heading" className={H2}>
                In the news
              </h2>
            </div>
            {stories.length === 0 ? (
              <p className="text-body text-text-muted">
                No stories about {tool.name} in The Signal yet.{' '}
                <Link href="/news" className="font-semibold text-text-link hover:text-text-link-hover">
                  Read today&apos;s edition
                </Link>
              </p>
            ) : (
              <div className="grid gap-8">
                {stories.map((story) => (
                  <article key={story.id} className="grid max-w-container-read justify-items-start gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {story.region && (
                        <Tag size="sm" variant="brown">
                          {story.region}
                        </Tag>
                      )}
                      <span className="font-mono text-data-sm text-text-muted">
                        {story.source} · {formatDate(story.published_at)}
                      </span>
                    </div>
                    <h3 className="font-display text-title-1 font-bold text-text-strong">
                      <TrackedLink
                        href={`/news/${story.id}`}
                        event="tool_to_news_click"
                        props={{ slug: tool.slug, story_id: story.id }}
                        className="text-inherit no-underline hover:underline"
                      >
                        {story.title}
                      </TrackedLink>
                    </h3>
                    {story.why_it_matters && (
                      <p className="text-body-sm text-text-body">
                        <b className="mr-1.5 font-semibold">Why it matters</b>
                        {story.why_it_matters}
                      </p>
                    )}
                    <TrackedLink href={`/news/${story.id}`} event="tool_to_news_click" props={{ slug: tool.slug, story_id: story.id }} className={MORE}>
                      Read the story →
                    </TrackedLink>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="grid gap-3 pt-1 md:gap-5 md:pt-0">
          <section aria-labelledby="changed-heading" className="grid gap-4 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5 md:p-6">
            <h2 id="changed-heading" className="font-display text-title-2 font-bold text-text-strong">
              What changed
            </h2>
            <ol className="grid list-none">
              {changes.map((c, i) => (
                <li key={c.kind} className="relative grid grid-cols-[10px_minmax(0,1fr)] gap-3.5 pb-[18px] last:pb-0">
                  {i < changes.length - 1 && (
                    <span aria-hidden="true" className="absolute -bottom-1 left-[4.5px] top-3.5 w-px bg-border-strong" />
                  )}
                  <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 rounded-full bg-ink-900" />
                  <div>
                    <p className="mb-0.5 font-mono text-data-sm uppercase tracking-label text-ink-700">
                      {formatDate(c.date)} · {c.kind}
                    </p>
                    <p className="text-body-sm text-text-body">{c.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <WatchTool />
          </section>

          <section aria-labelledby="verified-heading" className="grid gap-4 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="verified-heading" className="font-display text-title-2 font-bold text-text-strong">
                Bohemo Verified
              </h2>
              {tool.verified_at ? (
                <VerifiedBadge />
              ) : (
                <Tag size="sm" variant="outline">
                  Not yet
                </Tag>
              )}
            </div>
            <p className="text-body-sm text-text-body">
              {tool.verified_at
                ? `We checked ${tool.name}’s own claims on ${formatDate(tool.verified_at)}.`
                : `We haven’t checked ${tool.name}’s own claims yet, so it has no badge.`}
            </p>
            <ul className="grid list-none">
              {VERIFIED_CHECKS.map((check) => (
                <li
                  key={check}
                  className="grid min-h-hit-min grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2.5 border-t-hairline border-border-hairline text-[14.5px]"
                >
                  <Icon name={tool.verified_at ? 'circle-check' : 'clock'} size={18} />
                  <span>{check}</span>
                  <span className="whitespace-nowrap font-mono text-data-sm text-ink-700">{tool.verified_at ? 'Done' : 'Not yet'}</span>
                </li>
              ))}
            </ul>
            <p className="text-body-sm text-text-muted">
              Companies pay for the review, not the badge. If the claims don&apos;t check out, there&apos;s no badge.{' '}
              <Link href="/how-we-rate" className="text-text-strong underline underline-offset-[3px]">
                How we verify
              </Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
