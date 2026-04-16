import type { NewsArticle } from '@/types'

const REGION_COLOURS: Record<string, string> = {
  India:          'bg-orange-50 text-orange-700 border-orange-200',
  Singapore:      'bg-red-50    text-red-700    border-red-200',
  Indonesia:      'bg-green-50  text-green-700  border-green-200',
  'Southeast Asia':'bg-violet-50 text-violet-700 border-violet-200',
  Thailand:       'bg-blue-50   text-blue-700   border-blue-200',
  Vietnam:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  Philippines:    'bg-yellow-50 text-yellow-700 border-yellow-200',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  article: NewsArticle
}

export default function NewsCard({ article }: Props) {
  const regionStyle = REGION_COLOURS[article.region] ?? 'bg-[#E3DFD7] text-secondary border-[rgba(13,13,13,0.15)]'

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article className="card-hover flex flex-col gap-3">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`pill border text-xs ${regionStyle}`}>
              {article.region}
            </span>
            <span className="pill-filled text-xs">
              {article.category}
            </span>
          </div>
          <span className="text-xs text-muted shrink-0">
            {article.source} · {formatDate(article.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-semibold text-base text-ink leading-snug group-hover:underline decoration-1 underline-offset-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>

        {/* CTA */}
        <span className="text-xs font-medium text-muted group-hover:text-ink transition-colors">
          Read more →
        </span>
      </article>
    </a>
  )
}
