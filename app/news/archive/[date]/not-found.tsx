import { EmptyState } from '@/components/EmptyState'

export default function NotFound() {
  return (
    <EmptyState
      kind="notfound"
      title="No edition that day."
      body="We didn’t publish The Signal on that date, or the link is wrong."
      actionLabel="See past editions"
      actionHref="/news/archive"
    />
  )
}
