'use client'

import { useEffect, useRef, useState } from 'react'
import { INDIAN_STATES, UNION_TERRITORIES, type BillingPlan } from '@/lib/forms'
import { PRO_PRICE } from '@/lib/pricing'
import { readText, useSubmission } from '@/lib/useSubmission'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { FormAlert, Honeypot, SelectField, TextField } from '../forms/Fields'

interface ExpenseItProps {
  plan: BillingPlan
  market: string
}

const STATE_GROUPS = [
  { label: 'States', options: INDIAN_STATES.map((s) => ({ value: s, label: s })) },
  { label: 'Union territories', options: UNION_TERRITORIES.map((s) => ({ value: s, label: s })) },
]

const LINK_BTN =
  'inline-flex min-h-hit-min items-center rounded-pill px-1 text-[15px] font-semibold text-text-link underline-offset-4 outline-none hover:underline focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring'

/** "Expense it": GST details for the invoice, sent as an invoice_request. */
export function ExpenseIt({ plan, market }: ExpenseItProps) {
  const [open, setOpen] = useState<false | 'company' | 'finance'>(false)
  const { status, errors, send, reset } = useSubmission()
  const formRef = useRef<HTMLFormElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const sentRef = useRef<HTMLDivElement>(null)
  const [sentTo, setSentTo] = useState<{ email: string; finance: string } | null>(null)
  const annual = plan === 'annual'

  // Opening moves focus into the form: the finance field if that's what was asked for.
  useEffect(() => {
    if (!open) return
    const field = open === 'finance' ? 'finance_email' : 'company_name'
    formRef.current?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus()
  }, [open])

  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus()
  }, [status])

  function close() {
    setOpen(false)
    reset()
    // Return focus to the button that opened the form.
    requestAnimationFrame(() => openerRef.current?.focus())
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = readText(data, 'email')
    const finance = readText(data, 'finance_email')
    const ok = await send(e.currentTarget, {
      type: 'invoice_request',
      email,
      payload: {
        plan,
        company_name: readText(data, 'company_name'),
        gstin: readText(data, 'gstin'),
        billing_address: readText(data, 'billing_address'),
        state: readText(data, 'state'),
        finance_email: finance,
        market,
      },
    })
    if (ok) setSentTo({ email, finance })
  }

  return (
    <section
      id="gst"
      aria-labelledby="expense-heading"
      className="grid scroll-mt-24 gap-x-8 gap-y-4 rounded-b-lg border-hairline border-t-0 border-ink-900 bg-surface-raised p-5 md:grid-cols-[minmax(0,1fr)_280px] md:px-7 md:py-6"
    >
      <div>
        <p className="font-mono text-label font-medium uppercase text-text-muted">Expense it</p>
        <h2 id="expense-heading" className="mt-1.5 font-display text-title-2 font-bold text-text-strong">
          Paying through your company? Add its details once.
        </h2>
        <p className="mt-2 text-pretty text-[15px] leading-normal text-ink-700">
          Add your company name, address and GSTIN. We save them for your invoice, so you don’t type them again when you pay.
        </p>
      </div>
      <dl aria-label="What we save" className="m-0 grid grid-cols-[auto_minmax(0,1fr)] border-t-hairline border-border-strong text-[13.5px]">
        {[
          ['Billed to', 'Your company name'],
          ['GSTIN', 'Your GSTIN'],
          ['Plan', `Pro · ${annual ? 'annual' : 'monthly'}`],
          ['Total', annual ? PRO_PRICE.annual : PRO_PRICE.monthly],
        ].map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="border-b-hairline border-border-hairline py-2 text-ink-700">{k}</dt>
            <dd className="m-0 break-words border-b-hairline border-border-hairline py-2 pl-4 text-right font-mono text-[12.5px]">{v}</dd>
          </div>
        ))}
      </dl>

      {status === 'sent' && sentTo ? (
        <div ref={sentRef} tabIndex={-1} role="status" className="grid gap-1 border-t-hairline border-border-strong pt-4 outline-none md:col-span-2">
          <p className="flex items-start gap-2 font-semibold text-positive">
            <Icon name="circle-check" size={20} className="mt-0.5 shrink-0" />
            Saved. Your details are on file for your invoice.
          </p>
          <p className="text-body-sm text-ink-700">
            Pro isn&apos;t open for payment yet. When it opens, we&apos;ll email {sentTo.email}
            {sentTo.finance ? ` and send the payment link to ${sentTo.finance}` : ''}.
          </p>
        </div>
      ) : !open ? (
        <div className="grid items-center justify-items-center gap-x-6 gap-y-1 md:col-span-2 md:flex md:flex-wrap">
          <span className="w-full md:w-auto">
            <Button variant="secondary" block onClick={() => setOpen('company')}>
              Add GST details
            </Button>
          </span>
          <button ref={openerRef} type="button" className={LINK_BTN} onClick={() => setOpen('finance')}>
            Send this to my finance team →
          </button>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          aria-label="Company details for your invoice"
          className="relative grid gap-x-5 gap-y-4 border-t-hairline border-border-strong pt-4 md:col-span-2 md:grid-cols-2"
        >
          <TextField
            name="company_name"
            label="Company name"
            hint="The legal name on your GST certificate."
            autoComplete="organization"
            required
            error={errors.company_name}
          />
          <TextField
            name="gstin"
            label="GSTIN (optional)"
            hint="Saved for your invoice. Leave blank if you’re not GST-registered."
            maxLength={20}
            error={errors.gstin}
          />
          <TextField
            name="billing_address"
            label="Billing address"
            hint="Street, city and PIN code."
            autoComplete="street-address"
            required
            error={errors.billing_address}
            className="md:col-span-2"
          />
          <SelectField
            name="state"
            label="State"
            placeholder="Choose your state"
            hint="Saved for your invoice."
            groups={STATE_GROUPS}
            required
            error={errors.state}
          />
          <TextField
            name="email"
            type="email"
            label="Send invoices to"
            autoComplete="email"
            required
            error={errors.email}
          />

          <div className="grid gap-3 border-t-hairline border-border-hairline pt-4 md:col-span-2">
            <div>
              <h3 className="font-display text-title-3 font-bold text-text-strong">Send this to my finance team</h3>
              <p className="mt-1 text-[15px] leading-normal text-ink-700">
                Optional. They get the plan, the price and a payment link. The invoice goes to them. Pro goes to you.
              </p>
            </div>
            <TextField name="finance_email" type="email" label="Finance team’s email (optional)" error={errors.finance_email} />
          </div>

          <Honeypot />
          <FormAlert status={status} hasFieldErrors={Object.keys(errors).length > 0} className="md:col-span-2" />
          <p className="text-body-sm text-text-muted md:col-span-2">
            Pro isn&apos;t open for payment yet. We save these details for your invoice, and nothing is charged now.
          </p>
          <div className="grid items-center gap-x-4 gap-y-1 md:col-span-2 md:flex md:flex-wrap">
            <Button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Saving…' : 'Save GST details'}
            </Button>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-hit-min items-center justify-self-center rounded-pill px-2 text-sm font-semibold text-text-strong underline underline-offset-4 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
