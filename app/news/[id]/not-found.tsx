import { EmptyState } from '@/components/EmptyState'

export default function NotFound() {
  return (
    <EmptyState
      kind="notfound"
      title="We can’t find that story."
      body="It may have moved. Today’s edition is a good place to start."
      actionLabel="Go to The Signal"
      actionHref="/news"
    />
  )
}
