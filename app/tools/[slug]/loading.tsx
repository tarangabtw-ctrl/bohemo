import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-container gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_372px] md:gap-12 md:px-6">
      <div className="grid gap-6">
        <Skeleton variant="mark" label="Loading tool" />
        <Skeleton variant="lines" />
      </div>
      <Skeleton variant="card" />
    </div>
  )
}
