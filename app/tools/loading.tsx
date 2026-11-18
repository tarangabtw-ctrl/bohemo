import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-container px-4 pb-8 pt-6 md:px-6 md:pb-16 md:pt-10" aria-busy="true">
      <p className="font-mono text-label font-medium uppercase text-text-muted">Directory</p>
      <div className="mb-4 mt-6 flex items-center gap-3">
        <div className="w-[72px]">
          <Skeleton variant="mark" label="Loading tools" />
        </div>
        <span className="font-mono text-[12.5px] text-ink-700">Loading tools…</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <div className="hidden sm:block">
          <Skeleton variant="card" />
        </div>
        <div className="hidden xl:block">
          <Skeleton variant="card" />
        </div>
        <div className="hidden xl:block">
          <Skeleton variant="card" />
        </div>
      </div>
    </div>
  )
}
