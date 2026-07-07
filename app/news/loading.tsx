export default function NewsLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12" aria-busy="true">
      <div className="mb-8">
        <div className="h-10 w-48 max-w-full animate-pulse rounded-xl bg-cream-dark" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded-lg bg-cream-dark mt-3" />
      </div>
      <div className="mb-8 pb-6 border-b border-black/[0.08]">
        <div className="h-11 animate-pulse rounded-full bg-cream-dark" />
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-cream-dark" />
      <div className="mt-8 flex flex-col gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-cream-dark" />
        ))}
      </div>
    </div>
  )
}
