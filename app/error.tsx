'use client'

import Link from 'next/link'
import { EmptyState } from '@/components/EmptyState'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-container px-4 py-6 md:px-6 md:py-10">
      <div role="alert" className="grid justify-items-center gap-1 rounded-xl border-thin border-dashed border-border-strong px-4 pb-6 pt-2 md:pb-8">
        <EmptyState kind="error" title="That broke." body="Our fault, not yours. Try again." actionLabel="Try again" onAction={reset} />
        <Link href="/saved" className="inline-flex min-h-hit-min items-center text-[15px] font-semibold text-text-strong no-underline hover:underline">
          Open your saved tools →
        </Link>
      </div>
    </div>
  )
}
