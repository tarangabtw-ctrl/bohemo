'use client'

import { MARKETS } from '@/lib/markets'
import { FREE_PLAN_OPTIONS, LANGUAGE_OPTIONS, PAYMENT_OPTIONS } from '@/lib/forms'
import { readText, useSubmission } from '@/lib/useSubmission'
import { TOOL_CATEGORIES } from '@/types'
import { Button } from '../Button'
import { CheckboxField, ChipGroup, FormAlert, Honeypot, SelectField, TextField } from '../forms/Fields'

interface ToolSubmissionFormProps {
  onSent: (email: string) => void
}

const asOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }))

/** Adds https:// when someone types a bare domain like "example.com". */
function withScheme(value: string): string {
  if (!value || /^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function Section({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t-hairline border-border-hairline py-6 first:border-t-heavy first:border-ink-900 md:grid md:grid-cols-[56px_minmax(0,1fr)] md:py-7">
      <span aria-hidden="true" className="mb-1 block font-mono text-sm font-semibold leading-snug md:mb-0 md:leading-[29px]">
        {n}
      </span>
      <div className="grid gap-[18px]">
        <div>
          <h2 className="font-display text-title-2 font-bold text-text-strong">{title}</h2>
          {hint && <p className="mt-1 text-pretty text-[15px] leading-normal text-ink-700">{hint}</p>}
        </div>
        <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">{children}</div>
      </div>
    </section>
  )
}

export function ToolSubmissionForm({ onSent }: ToolSubmissionFormProps) {
  const { status, errors, send } = useSubmission()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const text = (key: string) => readText(data, key)
    const list = (key: string) => data.getAll(key).map(String)
    const email = text('email')
    const ok = await send(e.currentTarget, {
      type: 'tool_submission',
      email,
      payload: {
        tool_name: text('tool_name'),
        website: withScheme(text('website')),
        category: text('category'),
        description: text('description'),
        markets: list('markets'),
        languages: list('languages'),
        other_languages: text('other_languages'),
        free_plan: text('free_plan'),
        lowest_price: text('lowest_price'),
        pricing_page: withScheme(text('pricing_page')),
        payment_methods: list('payment_methods'),
        lightest_use: text('lightest_use'),
        data_location: text('data_location'),
        name: text('name'),
        role: text('role'),
        company_legal_name: text('company_legal_name'),
        speaks_for_company: data.get('speaks_for_company') === 'yes',
        wants_featured: data.get('wants_featured') === 'yes',
        wants_verified: data.get('wants_verified') === 'yes',
      },
    })
    if (ok) onSent(email)
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Submit your tool" className="relative">
      <Section n="01" title="The tool">
        <TextField name="tool_name" label="Tool name" required error={errors.tool_name} />
        <TextField name="website" type="url" label="Website" placeholder="https://" required error={errors.website} />
        <SelectField
          name="category"
          label="Category"
          placeholder="Choose a category"
          groups={[{ options: asOptions(TOOL_CATEGORIES) }]}
          required
          error={errors.category}
          className="md:col-span-2"
        />
        <TextField
          name="description"
          multiline
          label="What does it do, in one or two lines?"
          hint="Our editors write the final description. This tells them where to start."
          required
          error={errors.description}
          className="md:col-span-2"
        />
      </Section>

      <Section n="02" title="Where it works">
        <ChipGroup
          name="markets"
          label="Markets you serve today"
          options={MARKETS.map((m) => ({ value: m.id, label: m.name }))}
          error={errors.markets}
          className="md:col-span-2"
        />
        <ChipGroup
          name="languages"
          label="Languages the product works in"
          hint="Only languages a user can work in today, not ones on the roadmap."
          options={asOptions(LANGUAGE_OPTIONS)}
          error={errors.languages}
          className="md:col-span-2"
        />
        <TextField name="other_languages" label="Other languages" error={errors.other_languages} className="md:col-span-2" />
      </Section>

      <Section n="03" title="Pricing and payments">
        <ChipGroup name="free_plan" label="Is there a free plan?" single options={FREE_PLAN_OPTIONS} error={errors.free_plan} className="md:col-span-2" />
        <TextField name="lowest_price" label="Lowest paid price" hint="With currency and period, as on your pricing page." error={errors.lowest_price} />
        <TextField name="pricing_page" type="url" label="Pricing page" placeholder="https://" error={errors.pricing_page} />
        <ChipGroup
          name="payment_methods"
          label="Payment methods you accept"
          options={asOptions(PAYMENT_OPTIONS)}
          error={errors.payment_methods}
          className="md:col-span-2"
        />
      </Section>

      <Section
        n="04"
        title="Help us check Local Fit"
        hint="Optional. This tells us where to look. We still check each point ourselves, and your answers don’t fill any dots."
      >
        <TextField
          name="lightest_use"
          label="Lightest way to use it"
          hint="For example an Android app, a lite mode, WhatsApp or offline use."
          error={errors.lightest_use}
          className="md:col-span-2"
        />
        <TextField
          name="data_location"
          label="Where is user data stored?"
          hint="Country or region, and a link to your policy if you have one."
          error={errors.data_location}
          className="md:col-span-2"
        />
      </Section>

      <Section n="05" title="You">
        <TextField name="name" label="Your name" autoComplete="name" required error={errors.name} />
        <TextField
          name="email"
          type="email"
          label="Work email"
          hint="We send the review result here."
          autoComplete="email"
          required
          error={errors.email}
        />
        <TextField name="role" label="Your role" autoComplete="organization-title" error={errors.role} />
        <TextField name="company_legal_name" label="Company legal name" autoComplete="organization" error={errors.company_legal_name} />
        <div className="md:col-span-2">
          <CheckboxField name="speaks_for_company" error={errors.speaks_for_company}>
            I work at this company and can speak for it.
          </CheckboxField>
        </div>
      </Section>

      <Section n="06" title="Paid options" hint="Optional. Tick one and we’ll send prices. It doesn’t affect your listing or your score.">
        <div className="grid gap-1 md:col-span-2">
          <CheckboxField name="wants_featured">Featured placement. Always labelled &ldquo;Sponsored&rdquo;.</CheckboxField>
          <CheckboxField name="wants_verified">Bohemo Verified. We verify your own claims. It doesn&apos;t change the score.</CheckboxField>
        </div>
      </Section>

      <Honeypot />
      <div className="grid gap-4 border-t-heavy border-ink-900 pt-6 md:pl-14 md:pt-7">
        <FormAlert status={status} hasFieldErrors={Object.keys(errors).length > 0} />
        <div className="grid items-center gap-x-5 gap-y-3 md:flex md:flex-wrap">
          <Button type="submit" size="lg" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Submit your tool'}
          </Button>
          <p className="text-center text-sm text-ink-700 md:text-left">Free. No payment at this step.</p>
        </div>
      </div>
    </form>
  )
}
