'use client'

import { useId, useState } from 'react'
import { submitForm } from '@/lib/submit'
import { Button } from '../Button'
import { Icon } from '../Icon'

interface ReportMistakeFormProps {
  toolSlug: string
  toolName: string
  lastChecked: string | null
}

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'invalid'

const FIELD =
  'w-full rounded-md border-thin border-border-strong bg-surface-overlay px-4 font-body text-[15.5px] text-text-strong outline-none placeholder:text-ink-600 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2'
const LINK_BTN =
  'inline-flex min-h-hit-min items-center rounded-pill px-2 text-sm font-semibold text-text-link underline-offset-4 outline-none hover:underline focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring'

export function ReportMistakeForm({ toolSlug, toolName, lastChecked }: ReportMistakeFormProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const id = useId()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const value = (key: string) => String(form.get(key) ?? '').trim()
    if (!value('wrong')) {
      setStatus('invalid')
      return
    }
    setStatus('sending')
    const result = await submitForm({
      type: 'report_mistake',
      email: value('email') || undefined,
      honeypot: value('company'),
      payload: {
        tool_slug: toolSlug,
        whats_wrong: value('wrong'),
        correct_information: value('correct'),
        source_url: value('source'),
      },
    })
    setStatus(result === 'success' ? 'sent' : result)
  }

  return (
    <div className="mt-2">
      <div className="flex min-h-hit-min flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span className="text-body-sm text-text-muted">
          {lastChecked ? `Last checked ${lastChecked}. ` : 'Not checked yet. '}See something wrong?
        </span>
        {status !== 'sent' && (
          <button type="button" className={LINK_BTN} aria-expanded={open} aria-controls={`${id}-form`} onClick={() => setOpen((o) => !o)}>
            Report a mistake
          </button>
        )}
      </div>

      {status === 'sent' ? (
        <p role="status" className="mt-2 flex items-start gap-2 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5 font-semibold text-positive">
          <Icon name="circle-check" size={20} className="mt-0.5 shrink-0" />
          Thanks. An editor will check your report on {toolName} before anything changes.
        </p>
      ) : (
        open && (
          <form
            id={`${id}-form`}
            aria-label="Report a mistake"
            onSubmit={handleSubmit}
            noValidate
            className="mt-2 grid gap-x-5 gap-y-4 rounded-lg border-hairline border-border-ink bg-surface-raised px-4 py-5 md:grid-cols-2 md:p-6"
          >
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">What&apos;s wrong?</span>
              <textarea name="wrong" required aria-describedby={`${id}-wrong`} className={`${FIELD} min-h-24 resize-y py-3 leading-normal`} />
              <small id={`${id}-wrong`} className="text-[13px] leading-snug text-text-muted">
                Say which point or price it is.
              </small>
            </label>
            <label className="grid content-start gap-1.5">
              <span className="text-sm font-semibold">What is the correct information?</span>
              <textarea name="correct" className={`${FIELD} min-h-24 resize-y py-3 leading-normal`} />
            </label>
            <label className="grid content-start gap-1.5">
              <span className="text-sm font-semibold">Source link</span>
              <input name="source" type="url" placeholder="https://" aria-describedby={`${id}-source`} className={`${FIELD} min-h-hit-min`} />
              <small id={`${id}-source`} className="text-[13px] leading-snug text-text-muted">
                A page where we can confirm it.
              </small>
            </label>
            <label className="grid content-start gap-1.5">
              <span className="text-sm font-semibold">Your email (optional)</span>
              <input name="email" type="email" autoComplete="email" aria-describedby={`${id}-email`} className={`${FIELD} min-h-hit-min`} />
              <small id={`${id}-email`} className="text-[13px] leading-snug text-text-muted">
                Only if you want to hear back when we fix it.
              </small>
            </label>
            {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />

            {(status === 'error' || status === 'invalid') && (
              <p role="alert" className="flex items-start gap-2 text-sm font-medium text-negative md:col-span-2">
                <Icon name="circle-alert" size={18} className="mt-0.5 shrink-0" />
                {status === 'invalid'
                  ? 'Tell us what’s wrong, and check the email address if you added one.'
                  : 'That didn’t send. Our fault, not yours. Try again.'}
              </p>
            )}

            <div className="grid items-center gap-x-4 gap-y-2 md:col-span-2 md:flex md:flex-wrap">
              <Button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send report'}
              </Button>
              <button type="button" className={`${LINK_BTN} justify-self-center`} onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
            <p className="text-body-sm text-text-muted md:col-span-2">
              An editor checks every report before anything changes. Reports can&apos;t be paid for, and they don&apos;t change a score on their own.
            </p>
          </form>
        )
      )}
    </div>
  )
}
