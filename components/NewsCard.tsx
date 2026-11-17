import Link from 'next/link'
import type { NewsArticle } from '@/types'
import { Tag } from './Tag'

interface NewsCardProps {
  article: NewsArticle
  variant?: 'standard' | 'lead' | 'compact'
  readTime?: string
}

function dateline(article: NewsArticle) {
  const d = article.published_at ?? article.created_at
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
}

export function NewsCard({ article, variant = 'standard', readTime }: NewsCardProps) {
  const isCompact = variant === 'compact'
  const isLead = variant === 'lead'
  return (
    <Link
      href={`/news/${article.id}`}
      className={`flex flex-col gap-2.5 text-inherit no-underline ${
        isCompact
          ? 'border-b-hairline border-border-hairline py-4'
          : `rounded-lg border-hairline border-border-hairline bg-surface-raised p-5 transition-colors duration-fast hover:border-ink-900 ${
              isLead ? 'border-t-heavy border-border-ink' : ''
            }`
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant="brown" size="sm">
          {article.region}
        </Tag>
        {!isCompact && (
          <Tag size="sm" variant="neutral">
            {article.category}
          </Tag>
        )}
        {dateline(article) && <span className="font-mono text-xs uppercase tracking-label text-text-muted">{dateline(article)}</span>}
      </div>
      <h3
        className={`font-display font-bold leading-tight tracking-title text-text-strong ${
          isLead ? 'text-display-m' : isCompact ? 'text-lg' : 'text-xl'
        }`}
      >
        {article.title}
      </h3>
      {!isCompact && <p className={`text-ink-700 ${isLead ? 'text-[17px]' : 'text-[15px]'} leading-snug`}>{article.excerpt}</p>}
      {!isCompact && article.why_it_matters && (
        <p className="border-t-hairline border-border-hairline pt-2.5 text-sm text-text-strong">
          <b className="mr-1.5 font-mono text-[11.5px] font-medium uppercase tracking-label">Why it matters</b>
          {article.why_it_matters}
        </p>
      )}
      {(article.source || readTime) && (
        <div className="flex items-center justify-between font-mono text-xs text-text-muted">
          <span>{article.source}</span>
          <span>{readTime}</span>
        </div>
      )}
    </Link>
  )
}
