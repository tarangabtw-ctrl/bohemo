import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-container gap-8 px-4 py-10 md:px-6">
      <Skeleton variant="mark" label="Loading the story" />
      <Skeleton variant="lines" />
      <Skeleton variant="lines" />
    </div>
  )
}
