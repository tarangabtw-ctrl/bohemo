import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
        This page doesn&apos;t exist.
      </h1>
      <p className="text-base text-muted mt-3">
        The link may be broken, or the page may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center min-h-[44px] rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
      >
        ← Back home
      </Link>
    </div>
  )
}
