export default function ToolDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12" aria-busy="true">
      <div className="h-5 w-32 animate-pulse rounded-lg bg-cream-dark mb-8" />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="h-7 w-20 animate-pulse rounded-full bg-cream-dark" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-cream-dark" />
      </div>
      <div className="h-10 w-64 max-w-full animate-pulse rounded-xl bg-cream-dark" />
      <div className="h-20 animate-pulse rounded-xl bg-cream-dark mt-4" />
      <div className="h-11 w-44 animate-pulse rounded-full bg-cream-dark mt-6" />
    </div>
  )
}
