'use client'

import { useId, useState } from 'react'
import { readText, useSubmission } from '@/lib/useSubmission'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Honeypot } from '../forms/Fields'

interface ReportMistakeFormProps {
  toolSlug: string
  toolName: string
  lastChecked: string | null
}

const FIELD =
  'w-full rounded-md border-thin border-border-strong bg-surface-overlay px-4 font-body text-[15.5px] text-text-strong outline-none placeholder:text-ink-600 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2'
const LINK_BTN =
  'inline-flex min-h-hit-min items-center rounded-pill px-2 text-sm font-semibold text-text-link underline-offset-4 outline-none hover:underline focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring'

export function ReportMistakeForm({ toolSlug, toolName, lastChecked }: ReportMistakeFormProps) {
  const [open, setOpen] = useState(false)
  const { status, errors, send } = useSubmission()
  const id = useId()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    // Same rules as /api/submit: a link typed without https:// gets it added, then the strict check runs.
    await send(e.currentTarget, {
      type: 'report_mistake',
      email: readText(data, 'email'),
      payload: {
        tool_slug: toolSlug,
        whats_wrong: readText(data, 'wrong'),
        correct_information: readText(data, 'correct'),
        source_url: readText(data, 'source'),
      },
    })
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
              <textarea
                name="wrong"
                data-field="whats_wrong"
                required
                aria-invalid={errors.whats_wrong ? true : undefined}
                aria-describedby={`${id}-wrong`}
                className={`${FIELD} min-h-24 resize-y py-3 leading-normal`}
              />
              <small id={`${id}-wrong`} className={`text-[13px] leading-snug ${errors.whats_wrong ? 'font-medium text-negative' : 'text-text-muted'}`}>
                {errors.whats_wrong ?? 'Say which point or price it is.'}
              </small>
            </label>
            <label className="grid content-start gap-1.5">
              <span className="text-sm font-semibold">What is the correct information?</span>
              <textarea name="correct" data-field="correct_information" className={`${FIELD} min-h-24 resize-y py-3 leading-normal`} />
            </label>
            <label className="grid content-start gap-1.5">
              <span className="text-sm font-semibold">Source link</span>
              <input
                name="source"
                data-field="source_url"
                type="text"
                inputMode="url"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="example.com/pricing"
                aria-invalid={errors.source_url ? true : undefined}
                aria-describedby={`${id}-source`}
                className={`${FIELD} min-h-hit-min`}
              />
              <small id={`${id}-source`} className={`text-[13px] leading-snug ${errors.source_url ? 'font-medium text-negative' : 'text-text-muted'}`}>
                {errors.source_url ?? 'A page where we can confirm it.'}
              </small>
            </label>
            <label className="grid content-start gap-1.5">
              <span className="text-sm font-semibold">Your email (optional)</span>
              <input
                name="email"
                data-field="email"
                type="email"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={`${id}-email`}
                className={`${FIELD} min-h-hit-min`}
              />
              <small id={`${id}-email`} className={`text-[13px] leading-snug ${errors.email ? 'font-medium text-negative' : 'text-text-muted'}`}>
                {errors.email ?? 'Only if you want to hear back when we fix it.'}
              </small>
            </label>
            <Honeypot />

            {(status === 'error' || status === 'invalid') && (
              <p role="alert" className="flex items-start gap-2 text-sm font-medium text-negative md:col-span-2">
                <Icon name="circle-alert" size={18} className="mt-0.5 shrink-0" />
                {status === 'invalid'
                  ? 'Check the fields marked above.'
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
