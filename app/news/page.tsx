import { supabase } from '@/lib/supabase'
import { SEED_NEWS } from '@/lib/data'
import { SITE_URL } from '@/lib/site'
import type { NewsArticle } from '@/types'
import type { Metadata } from 'next'

const NEWS_TITLE = 'AI News — bohemo.'
const NEWS_DESCRIPTION = "What's happening in AI across India and Southeast Asia."

export const metadata: Metadata = {
  title: NEWS_TITLE,
  description: NEWS_DESCRIPTION,
  openGraph: {
    title: NEWS_TITLE,
    description: NEWS_DESCRIPTION,
    url: `${SITE_URL}/news`,
    siteName: 'bohemo.',
    type: 'website',
  },
}

// ── Region badge colours ──────────────────────────────────────────────────────
const REGION_BADGE: Record<string, string> = {
  India:           'bg-orange-50 text-orange-700 border border-orange-200',
  'Southeast Asia':'bg-blue-50   text-blue-700   border border-blue-200',
  Singapore:       'bg-blue-50   text-blue-700   border border-blue-200',
  Indonesia:       'bg-blue-50   text-blue-700   border border-blue-200',
  Thailand:        'bg-blue-50   text-blue-700   border border-blue-200',
  Vietnam:         'bg-blue-50   text-blue-700   border border-blue-200',
  Philippines:     'bg-blue-50   text-blue-700   border border-blue-200',
  Global:          'bg-[#F0EDE6] text-[#6B6560]  border border-black/10',
}

function regionBadge(region: string) {
  return REGION_BADGE[region] ?? 'bg-[#F0EDE6] text-[#6B6560] border border-black/10'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const REGIONS = ['India', 'Southeast Asia', 'Singapore', 'Indonesia']

interface Props {
  searchParams: { region?: string }
}

async function getNews(region?: string): Promise<NewsArticle[]> {
  if (supabase) {
    let query = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
    if (region) query = query.eq('region', region)

    const { data, error } = await query
    if (!error && data) return data as NewsArticle[]
  }

  let news = [...SEED_NEWS].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )
  if (region) news = news.filter((n) => n.region === region)
  return news
}

export default async function NewsPage({ searchParams }: Props) {
  const { region } = searchParams
  const articles = await getNews(region)

  const [featured, ...rest] = articles

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#0D0D0D]">AI News</h1>
        <p className="text-[#6B6560] text-base mt-2">
          What&rsquo;s happening in AI across India and Southeast Asia
        </p>
      </div>

      {/* ── Region filter ───────────────────────────────── */}
      <div className="mb-8 pb-6 border-b border-black/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#6B6560] uppercase tracking-wide w-16 shrink-0">
            Region
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <a
              href="/news"
              className={`pill border text-xs transition-colors whitespace-nowrap ${
                !region
                  ? 'bg-[#0D0D0D] text-[#F0EDE6] border-[#0D0D0D]'
                  : 'bg-transparent text-[#0D0D0D] border-black/20 hover:border-black/60'
              }`}
            >
              All
            </a>
            {REGIONS.map((r) => (
              <a
                key={r}
                href={`/news?region=${encodeURIComponent(r)}`}
                className={`pill border text-xs transition-colors whitespace-nowrap ${
                  region === r
                    ? 'bg-[#0D0D0D] text-[#F0EDE6] border-[#0D0D0D]'
                    : 'bg-transparent text-[#0D0D0D] border-black/20 hover:border-black/60'
                }`}
              >
                {r}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────── */}
      {articles.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-[#6B6560]">No articles found.</p>
          <a href="/news" className="mt-3 inline-block text-sm font-medium underline underline-offset-2">
            Reset filters
          </a>
        </div>
      )}

      {/* ── Featured article (index 0) ───────────────────── */}
      {featured && (
        <a
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block mb-2"
        >
          <article className="bg-white rounded-2xl p-8 border border-black/[0.08] hover:border-black/20 hover:shadow-md transition-all duration-200">
            {/* Source + date */}
            <div className="flex items-center gap-2 text-xs text-[#6B6560]">
              <span>{featured.source}</span>
              <span>·</span>
              <span>{formatDate(featured.published_at)}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-[#0D0D0D] mt-2 leading-snug group-hover:underline decoration-1 underline-offset-2">
              {featured.title}
            </h2>

            {/* Summary — no truncation on featured */}
            <p className="text-base text-[#6B6560] mt-3 leading-relaxed">
              {featured.excerpt}
            </p>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-6">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${regionBadge(featured.region)}`}>
                {featured.region}
              </span>
              <span className="text-xs font-medium text-[#6B6560] group-hover:text-[#0D0D0D] transition-colors">
                Read article →
              </span>
            </div>
          </article>
        </a>
      )}

      {/* ── Compact list (remaining articles) ───────────── */}
      {rest.length > 0 && (
        <div className="mt-8">
          {rest.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-5 border-b border-black/[0.08] last:border-b-0"
            >
              {/* Top row: region badge + source (left) | date (right) */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${regionBadge(article.region)}`}>
                    {article.region}
                  </span>
                  <span className="text-xs text-[#6B6560] truncate">{article.source}</span>
                </div>
                <span className="text-xs text-[#6B6560] shrink-0">{formatDate(article.published_at)}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-[#0D0D0D] mt-1 group-hover:underline decoration-1 underline-offset-2 leading-snug">
                {article.title}
              </h3>

              {/* Summary */}
              <p className="text-sm text-[#6B6560] mt-1 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            </a>
          ))}
        </div>
      )}

    </div>
  )
}
