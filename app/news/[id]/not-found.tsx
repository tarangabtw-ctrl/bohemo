import Link from 'next/link'

export default function NewsArticleNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center bg-cream">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
        This story isn&apos;t in the feed.
      </h1>
      <p className="text-base text-muted mt-3">
        It may have been removed or never existed.
      </p>
      <Link
        href="/news"
        className="mt-8 inline-flex items-center justify-center min-h-[44px] rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
      >
        ← Back to news
      </Link>
    </div>
  )
}
