'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { REVIEW_TIME } from '@/lib/pricing'
import { ToolSubmissionForm } from './ToolSubmissionForm'
import { TalkToUsForm } from './TalkToUsForm'

const NEXT_STEPS = [
  `An editor reads your submission within ${REVIEW_TIME}.`,
  'We write the tool page ourselves. Every page has “Report a mistake” if we get something wrong.',
  'We check Local Fit on our own schedule. Until a check is done, its dot stays empty and says “not checked yet”.',
  'We email you when the page is live.',
]

const FIT_CHECKS = [
  'Languages',
  'Local payment methods',
  'Local-currency pricing',
  'Works on low-end Android and low bandwidth',
  'Data stored in-region',
]

const MORE = 'inline-flex min-h-hit-min items-center text-[15px] font-semibold text-text-link no-underline hover:underline'

function Steps({ className = '' }: { className?: string }) {
  return (
    <ol className={`m-0 list-none p-0 ${className}`}>
      {NEXT_STEPS.map((s, i) => (
        <li key={s} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-b-hairline border-border-hairline py-3.5 text-pretty text-[15px] leading-snug">
          <span className="font-mono text-[12.5px] leading-[22px] text-ink-700">{String(i + 1).padStart(2, '0')}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  )
}

function Rail() {
  return (
    <aside className="mt-10 grid gap-8 md:sticky md:top-24 md:mt-0 md:gap-9">
      <div>
        <h2 className="border-b-hairline border-border-strong pb-2.5 font-display text-title-3 font-bold text-text-strong">What happens next</h2>
        <Steps />
      </div>
      <div>
        <h2 className="border-b-hairline border-border-strong pb-2.5 font-display text-title-3 font-bold text-text-strong">Local Fit, the 5 checks</h2>
        <ul className="m-0 list-none p-0">
          {FIT_CHECKS.map((f) => (
            <li key={f} className="flex items-center gap-2.5 border-b-hairline border-border-hairline py-2.5 text-[15px]">
              <span aria-hidden="true" className="h-[11px] w-[11px] shrink-0 rounded-full border-thin border-ink-900" />
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-pretty text-sm leading-normal text-ink-700">
          Checked by Bohemo for every tool, paid or not. Paying can&apos;t fill a dot, speed a check up or change a score.
        </p>
        <Link className={MORE} href="/how-we-rate">
          How we rate →
        </Link>
      </div>
    </aside>
  )
}

export function GetListedView() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const sent = sentTo !== null

  // After sending, the page swaps to the confirmation: start reading it from the top.
  useEffect(() => {
    if (!sent) return
    window.scrollTo({ top: 0 })
    headingRef.current?.focus()
  }, [sent])

  return (
    <div className="mx-auto max-w-container px-4 pb-10 md:px-6 md:pb-[72px]">
      <header className="pt-7 md:pt-12">
        <p className="font-mono text-label font-medium uppercase text-text-muted">For AI companies · Get listed</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-display-xl font-extrabold text-text-strong outline-none md:mt-3">
          {sent ? 'Got it. Your tool is in the queue.' : 'Submit your tool.'}
        </h1>
        {!sent && (
          <p className="mt-3 max-w-[620px] text-pretty text-[17px] leading-normal text-ink-700 md:mt-4 md:text-[19px]">
            Listing is free. An editor reviews every submission and writes the tool page.
          </p>
        )}
      </header>

      {sent ? (
        <div role="status" className="mt-7 grid max-w-[760px] justify-items-start gap-4 border-t-heavy border-ink-900 pt-5 md:mt-10 md:pt-7">
          <p className="text-pretty text-[17px] leading-normal text-ink-700 md:text-[19px]">
            We&apos;ll write to {sentTo} when there&apos;s news. Nothing was charged, and nothing you ticked changes your score.
          </p>
          <Steps className="mt-2 w-full border-t-hairline border-border-strong" />
          <div className="grid gap-0 md:flex md:flex-wrap md:gap-x-8">
            <Link className={MORE} href="/how-we-rate">
              How we rate →
            </Link>
            <Link className={MORE} href="/tools">
              Browse the directory →
            </Link>
            <button type="button" className={`${MORE} cursor-pointer border-0 bg-transparent p-0 font-body`} onClick={() => setSentTo(null)}>
              Submit another tool →
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="pt-7 md:grid md:grid-cols-[minmax(0,760px)_minmax(0,1fr)] md:items-start md:gap-12 md:pt-10 lg:gap-20">
            <ToolSubmissionForm onSent={setSentTo} />
            <Rail />
          </div>
          <TalkToUsForm />
        </>
      )}
    </div>
  )
}
