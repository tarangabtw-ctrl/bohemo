export default function ToolsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12" aria-busy="true">
      <div className="mb-8">
        <div className="h-10 w-72 max-w-full animate-pulse rounded-xl bg-cream-dark" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded-lg bg-cream-dark mt-3" />
      </div>
      <div className="mb-4 h-11 animate-pulse rounded-full bg-cream-dark" />
      <div className="mb-8 pb-6 border-b border-black/[0.08]">
        <div className="h-20 animate-pulse rounded-xl bg-cream-dark" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-cream-dark" />
        ))}
      </div>
    </div>
  )
}
