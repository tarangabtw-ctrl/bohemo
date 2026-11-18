import { Button } from '../Button'
import { FREE_ARCHIVE_DAYS } from '@/lib/edition'

/** Where the free archive ends. Older editions are part of Pro. */
export function ProGate({ olderCount }: { olderCount?: number }) {
  return (
    <section aria-label="Older editions are part of Pro" className="mt-2 grid justify-items-start gap-2.5 border-t-heavy border-ink-900 pt-5">
      <p className="font-mono text-label font-medium uppercase text-ink-700">Free ends here · the last {FREE_ARCHIVE_DAYS} days</p>
      <h2 className="font-display text-title-2 font-bold text-text-strong">
        {olderCount ? `${olderCount} older ${olderCount === 1 ? 'edition is' : 'editions are'} in the full archive.` : 'Older editions are in the full archive.'}
      </h2>
      <p className="max-w-[560px] text-pretty text-body text-text-body">
        Free readers get the last {FREE_ARCHIVE_DAYS} days of The Signal. Pro opens every edition.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Button href="/pricing">Get Pro</Button>
        <span className="text-body-sm text-text-muted">₹499/mo or ₹4,990/yr</span>
      </div>
    </section>
  )
}
