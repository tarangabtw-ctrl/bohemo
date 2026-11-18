import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-container gap-5 px-4 py-8 sm:grid-cols-2 md:px-6 xl:grid-cols-3">
      <Skeleton variant="card" label="Loading your saves" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
    </div>
  )
}
