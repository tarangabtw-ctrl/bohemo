import { EmptyState } from '@/components/EmptyState'

export default function NotFound() {
  return (
    <EmptyState
      kind="notfound"
      title="We don’t list that tool."
      body="It may have moved, or we haven’t checked it yet."
      actionLabel="Browse all tools"
      actionHref="/tools"
    />
  )
}
