import NewsCard from '@/components/NewsCard'
import { supabase } from '@/lib/supabase'
import { SEED_NEWS } from '@/lib/data'
import type { NewsArticle } from '@/types'

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-2">AI News</h1>
        <p className="text-muted text-sm">
          Curated AI news from India and Southeast Asia.
        </p>
      </div>

      {/* Region filter */}
      <div className="mb-8 rounded-2xl bg-cream-mid border border-[rgba(13,13,13,0.08)] px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted uppercase tracking-wide w-16 shrink-0">
            Region
          </span>
          <a
            href="/news"
            className={`pill border text-xs transition-colors ${
              !region
                ? 'bg-ink text-cream border-ink'
                : 'bg-transparent text-secondary border-[rgba(13,13,13,0.15)] hover:bg-cream-dark'
            }`}
          >
            All
          </a>
          {REGIONS.map((r) => (
            <a
              key={r}
              href={`/news?region=${encodeURIComponent(r)}`}
              className={`pill border text-xs transition-colors ${
                region === r
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-transparent text-secondary border-[rgba(13,13,13,0.15)] hover:bg-cream-dark'
              }`}
            >
              {r}
            </a>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted mb-4">
        {articles.length} article{articles.length !== 1 ? 's' : ''}
        {region && (
          <>
            {' '}in <span className="font-medium text-secondary">{region}</span>
            {' — '}
            <a href="/news" className="underline underline-offset-2 hover:text-ink transition-colors">
              Show all
            </a>
          </>
        )}
      </p>

      {/* News list */}
      {articles.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted">No articles found.</p>
          <a href="/news" className="mt-3 inline-block text-sm font-medium underline underline-offset-2">
            Reset filters
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
