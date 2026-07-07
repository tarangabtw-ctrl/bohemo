export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12" aria-busy="true">
      <div className="h-5 w-40 animate-pulse rounded-lg bg-cream-dark mb-8" />
      <div className="h-10 w-64 max-w-full animate-pulse rounded-xl bg-cream-dark mb-8" />
      <div className="h-96 animate-pulse rounded-2xl bg-cream-dark" />
    </div>
  )
}
