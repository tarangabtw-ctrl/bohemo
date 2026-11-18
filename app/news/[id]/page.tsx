import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticle, getRelatedArticles, getEditionIndex, getToolsBySlug } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { formatDate } from '@/lib/utils'
import { formatEditionDate, groupEditions, pad2, readMinutes, todayIST } from '@/lib/edition'
import { Tag } from '@/components/Tag'
import { NewsletterForm } from '@/components/NewsletterForm'
import { EditionProgress } from '@/components/news/EditionProgress'
import { EditionTime } from '@/components/news/EditionTime'
import { ArticleToolCards, EditionToc, MarkRead, SaveStoryButton, WhyItMattersLabel } from '@/components/news/ArticleParts'

export const revalidate = 60

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

function sourceHost(url: string): string | null {
  if (!url || url === '#') return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const MORE = 'inline-flex min-h-hit-min items-center text-sm font-semibold text-text-link hover:text-text-link-hover'

export default async function NewsArticlePage({ params }: Props) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const [index, tools] = await Promise.all([getEditionIndex(), getToolsBySlug(article.tools_mentioned)])
  const edition = article.edition_date ? groupEditions(index).find((e) => e.date === article.edition_date) : undefined
  const position = edition ? edition.stories.findIndex((s) => s.id === article.id) : -1
  const inEdition = edition && position >= 0
  const n = position + 1
  const total = edition?.stories.length ?? 0
  const next = inEdition ? edition.stories[position + 1] : undefined
  const isToday = edition?.date === todayIST()
  const related = inEdition ? [] : await getRelatedArticles(article.region, article.id)

  const date = article.published_at ?? article.created_at
  const host = sourceHost(article.url)
  const minutes = readMinutes(article)
  const paragraphs = (article.excerpt ?? '').split(/(?<=[.!?])\s+/).filter(Boolean)
  const editionHref = edition ? (isToday ? '/news' : `/news/archive/${edition.date}`) : '/news'
  const editionName = isToday ? 'today’s edition' : 'this edition'

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
      <MarkRead id={article.id} />

      {inEdition && (
        <div className="sticky top-[60px] z-10 border-b-hairline border-ink-900 bg-surface-page">
          <div className="mx-auto flex min-h-[52px] max-w-container flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 md:px-6">
            <EditionProgress
              total={total}
              done={n - 1}
              current={n}
              label={
                <b>
                  Story {n} of {total}
                </b>
              }
            />
            <span className="font-mono text-[12.5px] text-ink-700">
              {minutes} min read · {next ? `${total - n} left after this` : 'last one'}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-container items-start gap-x-20 px-4 pb-12 md:grid-cols-[minmax(0,760px)_minmax(0,1fr)] md:px-6 md:pb-16">
        <article className="min-w-0">
          <nav aria-label="Breadcrumb" className="mt-1 md:mt-3">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[13px] text-ink-700">
              <li>
                <Link href="/news" className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline">
                  News
                </Link>
              </li>
              {inEdition && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={editionHref} className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline">
                      Edition #{edition.number}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-text-strong">
                {inEdition ? `Story ${pad2(n)}` : 'Story'}
              </li>
            </ol>
          </nav>

          <header className="grid gap-3.5 border-b-heavy border-ink-900 pb-6 pt-2">
            <div className="flex min-h-[26px] flex-wrap items-center gap-2.5">
              {inEdition && <span className="font-mono text-sm font-semibold">{pad2(n)}</span>}
              {article.region && (
                <Tag variant="brown" size="sm">
                  {article.region}
                </Tag>
              )}
              <span className="font-mono text-data-sm uppercase tracking-[0.04em] text-ink-700">
                {article.source}
                {date && ` · ${formatDate(date)}`}
              </span>
            </div>
            <h1 className="text-balance font-display text-display-l font-extrabold text-text-strong">{article.title}</h1>
            <div className="flex min-h-hit-min items-center justify-between gap-3">
              <span className="font-mono text-[12.5px] text-ink-700">
                Summary by Bohemo · {minutes} min read
                {edition && ` · ${formatEditionDate(edition.date)}`}
              </span>
              <SaveStoryButton id={article.id} title={article.title} />
            </div>
          </header>

          {paragraphs.length > 0 && (
            <div className="grid max-w-container-read gap-[18px] pt-8">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`text-pretty text-text-strong ${i === 0 ? 'text-title-2 font-medium' : 'text-body-lg'}`}
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {article.why_it_matters && (
            <aside className="mt-9 grid gap-2.5 rounded-lg bg-surface-inverse px-6 py-7 md:px-8">
              <h2 className="font-mono text-label font-medium uppercase text-sand-300">
                <WhyItMattersLabel region={article.region} />
              </h2>
              <p className="text-pretty font-display text-title-1 font-bold text-text-inverse">{article.why_it_matters}</p>
            </aside>
          )}

          {tools.length > 0 && (
            <section className="mt-9 grid gap-3">
              <h2 className="font-mono text-label font-medium uppercase text-text-muted">
                {tools.length > 1 ? 'Tools in this story' : 'Tool in this story'}
              </h2>
              <ArticleToolCards tools={tools} />
            </section>
          )}

          {host && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 flex min-h-16 items-center rounded-lg border-hairline border-ink-900 px-6 py-4 text-text-strong no-underline hover:bg-cream-300"
            >
              <span>
                <b className="block font-display text-title-3 font-bold">Read the original at {article.source} ↗</b>
                <span className="font-mono text-[12.5px] text-ink-700">{host} · opens in a new tab</span>
              </span>
            </a>
          )}

          {inEdition ? (
            <nav aria-label={`Next in ${editionName}`} className="mt-14 grid gap-5 border-t-heavy border-ink-900 pt-5">
              <EditionProgress
                total={total}
                done={n}
                label={
                  <span>
                    <b>
                      {n} of {total}
                    </b>{' '}
                    read
                  </span>
                }
              />
              {next ? (
                <Link href={`/news/${next.id}`} className="group grid gap-3 text-inherit no-underline">
                  <span className="font-mono text-label font-medium uppercase text-text-muted">
                    Next · story {pad2(n + 1)} of {pad2(total)} · {readMinutes(next)} min
                  </span>
                  <b className="text-pretty font-display text-title-1 font-bold text-text-strong decoration-2 underline-offset-4 group-hover:underline">
                    {next.title}
                  </b>
                  <span className="flex min-h-hit-min flex-wrap items-center gap-2.5">
                    {next.region && (
                      <Tag variant="brown" size="sm">
                        {next.region}
                      </Tag>
                    )}
                    <span className="font-mono text-data-sm uppercase tracking-[0.04em] text-ink-700">
                      {next.source}
                      {next.published_at && ` · ${formatDate(next.published_at)}`}
                    </span>
                    <span className="ml-auto text-[15px] font-semibold">Next story →</span>
                  </span>
                </Link>
              ) : (
                <div className="grid gap-3">
                  <span className="font-mono text-label font-medium uppercase text-text-muted">
                    That was story {pad2(n)} of {pad2(total)}
                  </span>
                  <b className="font-display text-display-m font-extrabold text-text-strong">
                    {isToday ? 'You’re caught up.' : 'That’s the edition.'}
                  </b>
                  <span className="text-pretty text-body-lg text-ink-700">
                    {isToday && 'That’s today’s edition. Go build something. '}
                    The next one lands at <EditionTime />.
                  </span>
                  <span className="flex flex-wrap gap-x-8 gap-y-2">
                    <Link href="/news" className={MORE}>
                      Back to today&apos;s edition →
                    </Link>
                    <Link href="/news/archive" className={MORE}>
                      Past editions →
                    </Link>
                  </span>
                </div>
              )}
            </nav>
          ) : (
            related.length > 0 && (
              <section className="mt-14 border-t-heavy border-ink-900 pt-5">
                <h2 className="font-display text-title-2 font-bold text-text-strong">More from {article.region}</h2>
                <ul className="list-none">
                  {related.map((r) => (
                    <li key={r.id} className="border-b-hairline border-border-hairline py-4">
                      <Link href={`/news/${r.id}`} className="font-display text-title-3 font-bold text-text-strong no-underline hover:underline">
                        {r.title}
                      </Link>
                      <p className="mt-1 font-mono text-data-sm uppercase tracking-[0.04em] text-ink-700">
                        {r.source} · {formatDate(r.published_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )
          )}

          <section className="mt-10 grid gap-4 rounded-lg border-hairline border-border-hairline bg-surface-raised p-6 md:p-8">
            <h2 className="font-display text-title-2 font-bold text-text-strong">
              Get The Signal in your inbox at <EditionTime />
            </h2>
            <NewsletterForm />
          </section>
        </article>

        {inEdition && (
          <aside className="hidden pt-8 md:sticky md:top-[128px] md:block">
            <h2 className="border-b-hairline border-border-strong pb-2.5 font-display text-title-3 font-bold text-text-strong">
              {isToday ? 'Today’s edition' : `Edition #${edition.number} · ${formatEditionDate(edition.date, false)}`}
            </h2>
            <EditionToc stories={edition.stories} currentId={article.id} />
            <Link href={editionHref} className={MORE}>
              Back to the edition →
            </Link>
          </aside>
        )}
      </div>
    </>
  )
}
