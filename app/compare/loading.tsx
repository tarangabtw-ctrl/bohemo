import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-container gap-4 px-4 py-8 md:grid-cols-3 md:px-6">
      <Skeleton variant="card" label="Loading comparison" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
    </div>
  )
}
