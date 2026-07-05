import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SEED_NEWS } from '@/lib/data'
import { SITE_URL } from '@/lib/site'
import type { NewsArticle } from '@/types'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

const REGION_BADGE: Record<string, string> = {
  India:            'bg-orange-50 text-orange-700 border border-orange-200',
  'Southeast Asia': 'bg-blue-50   text-blue-700   border border-blue-200',
  Singapore:        'bg-blue-50   text-blue-700   border border-blue-200',
  Indonesia:        'bg-blue-50   text-blue-700   border border-blue-200',
  Thailand:         'bg-blue-50   text-blue-700   border border-blue-200',
  Vietnam:          'bg-blue-50   text-blue-700   border border-blue-200',
  Philippines:      'bg-blue-50   text-blue-700   border border-blue-200',
  Global:           'bg-[#F0EDE6] text-[#6B6560]  border border-black/10',
}

function regionBadge(region: string) {
  return REGION_BADGE[region] ?? 'bg-[#F0EDE6] text-[#6B6560] border border-black/10'
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

async function getArticle(id: string): Promise<NewsArticle | null> {
  if (supabase) {
    const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
    if (!error && data) return data as NewsArticle
  }
  return SEED_NEWS.find((n) => n.id === id) ?? null
}

async function getRelatedArticles(region: string, id: string): Promise<NewsArticle[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('region', region)
      .neq('id', id)
      .limit(3)
    if (!error && data) return data as NewsArticle[]
  }
  return SEED_NEWS.filter((n) => n.region === region && n.id !== id).slice(0, 3)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.id)
  if (!article) {
    return {
      title: 'Story not found — bohemo.',
      description: 'This news story could not be found in the bohemo. feed.',
    }
  }

  const title = `${article.title} — bohemo.`
  return {
    title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title,
      description: article.excerpt ?? undefined,
      url: `${SITE_URL}/news/${article.id}`,
      siteName: 'bohemo.',
      type: 'article',
    },
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const related = await getRelatedArticles(article.region, article.id)
  const displayDate = formatDate(article.published_at) ?? formatDate(article.created_at)

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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 min-h-[44px] text-sm text-muted hover:text-ink transition-colors mb-8"
      >
        ← Back to news
      </Link>

      {/* Source + region pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-sm sm:text-xs font-medium px-2.5 py-0.5 rounded-full ${regionBadge(article.region)}`}>
          {article.region}
        </span>
        <span className="pill-filled text-sm sm:text-xs">{article.source}</span>
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink leading-tight">
        {article.title}
      </h1>

      {displayDate && <p className="text-sm text-muted mt-3">{displayDate}</p>}

      <p className="text-base text-secondary leading-relaxed mt-6">{article.excerpt}</p>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center min-h-[44px] rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
      >
        Read the original ↗
      </a>

      {/* Divider */}
      <div className="border-t border-[rgba(13,13,13,0.10)] my-10" />

      {/* More from this region */}
      {related.length > 0 && (
        <div>
          <h2 className="text-sm sm:text-xs font-semibold text-muted uppercase tracking-wide mb-4">
            More from {article.region}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="group block h-full">
                <article className="card-hover h-full flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-sm sm:text-xs font-medium px-2.5 py-0.5 rounded-full ${regionBadge(item.region)}`}>
                      {item.region}
                    </span>
                    <span className="text-sm sm:text-xs text-muted shrink-0">{item.source}</span>
                  </div>
                  <h3 className="font-semibold text-base text-ink leading-snug group-hover:underline decoration-1 underline-offset-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed line-clamp-3">{item.excerpt}</p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
