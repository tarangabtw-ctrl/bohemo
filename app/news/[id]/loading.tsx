export default function NewsArticleLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12" aria-busy="true">
      <div className="h-5 w-32 animate-pulse rounded-lg bg-cream-dark mb-8" />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="h-7 w-20 animate-pulse rounded-full bg-cream-dark" />
        <div className="h-7 w-28 animate-pulse rounded-full bg-cream-dark" />
      </div>
      <div className="h-10 animate-pulse rounded-xl bg-cream-dark" />
      <div className="h-10 w-2/3 animate-pulse rounded-xl bg-cream-dark mt-2" />
      <div className="h-24 animate-pulse rounded-xl bg-cream-dark mt-6" />
      <div className="h-11 w-48 animate-pulse rounded-full bg-cream-dark mt-8" />
    </div>
  )
}
