import { redirect } from 'next/navigation'

// Compare moved to /compare in v2. Keep old links working.
interface Props {
  searchParams: { tools?: string }
}

export default function OldComparePage({ searchParams }: Props) {
  redirect(searchParams.tools ? `/compare?tools=${encodeURIComponent(searchParams.tools)}` : '/compare')
}
