'use client'

import { useEffect, useRef } from 'react'
import type { BillingPlan } from '@/lib/forms'
import { readText, useSubmission } from '@/lib/useSubmission'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { ChipGroup, FormAlert, Honeypot, TextField } from '../forms/Fields'

interface ProWaitlistFormProps {
  plan: BillingPlan
  market: string
  onCancel: () => void
}

const PLAN_OPTIONS = [
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
]

/** Founding-member waitlist. Stands in for checkout until payments go live (SPEC.md). */
export function ProWaitlistForm({ plan, market, onCancel }: ProWaitlistFormProps) {
  const { status, errors, send } = useSubmission()
  const formRef = useRef<HTMLFormElement>(null)
  const sentRef = useRef<HTMLParagraphElement>(null)

  // Opening the form moves focus to its first field.
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>('input[name="email"]')?.focus()
  }, [])

  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus()
  }, [status])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    await send(e.currentTarget, {
      type: 'pro_waitlist',
      email: readText(data, 'email'),
      payload: {
        plan: readText(data, 'plan'),
        company_name: readText(data, 'company_name'),
        gstin: readText(data, 'gstin'),
        market,
      },
    })
  }

  if (status === 'sent') {
    return (
      <p
        ref={sentRef}
        tabIndex={-1}
        role="status"
        className="flex items-start gap-2 rounded-md bg-surface-raised p-5 font-semibold text-positive outline-none"
      >
        <Icon name="circle-check" size={20} className="mt-0.5 shrink-0" />
        You&apos;re on the list. We&apos;ll email you when Pro opens, at the founding price.
      </p>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Join the Pro waitlist"
      className="relative grid gap-4 rounded-md bg-surface-raised p-4 text-text-strong md:grid-cols-2 md:p-5"
    >
      <div className="md:col-span-2">
        <h3 className="font-display text-title-3 font-bold text-text-strong">Join the founding-member waitlist</h3>
        <p className="mt-1 text-body-sm text-text-muted">
          Payments aren&apos;t open yet. Leave your email and we&apos;ll tell you the day Pro opens. Nothing is charged now.
        </p>
      </div>
      <TextField
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        error={errors.email}
        className="md:col-span-2"
      />
      <ChipGroup name="plan" label="Plan" single options={PLAN_OPTIONS} defaultValue={[plan]} error={errors.plan} className="md:col-span-2" />
      <TextField name="company_name" label="Company name (optional)" autoComplete="organization" error={errors.company_name} />
      <TextField
        name="gstin"
        label="GSTIN (optional)"
        hint="For a GST invoice when you pay."
        maxLength={20}
        error={errors.gstin}
      />
      <Honeypot />
      <FormAlert status={status} hasFieldErrors={Object.keys(errors).length > 0} className="md:col-span-2" />
      <div className="grid items-center gap-x-4 gap-y-1 md:col-span-2 md:flex md:flex-wrap">
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Join the waitlist'}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-hit-min items-center justify-self-center rounded-pill px-2 text-sm font-semibold text-text-strong underline underline-offset-4 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
