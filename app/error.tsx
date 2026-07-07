'use client'

// Route-level error boundary: renders instead of a crashed page when
// anything below the root layout throws during render or data fetching.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
        Something went wrong.
      </h1>
      <p className="text-base text-muted mt-3">
        We couldn&apos;t load this page. It&apos;s us, not you — try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center justify-center min-h-[44px] rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
