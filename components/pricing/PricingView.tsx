'use client'

import { useEffect, useRef, useState } from 'react'
import { useMarket } from '../MarketProvider'
import { MARKETS } from '@/lib/markets'
import { FOUNDING_PLACES, PRO_PRICE } from '@/lib/pricing'
import type { BillingPlan } from '@/lib/forms'
import { track } from '@/lib/analytics'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Tag } from '../Tag'
import { BillingToggle } from './BillingToggle'
import { ExpenseIt } from './ExpenseIt'
import { ForCompanies } from './ForCompanies'
import { ProWaitlistForm } from './ProWaitlistForm'

type Audience = 'readers' | 'companies'

const AUDIENCES: { id: Audience; label: string }[] = [
  { id: 'readers', label: 'For readers & builders' },
  { id: 'companies', label: 'For AI companies' },
]

const FREE_FEATURES = [
  'Every tool, with its full Local Fit: score, all 5 checks and notes',
  'The Signal every day, on the site or by email, and the last 7 days',
  'Save up to 20 tools, stacks or stories',
]
const PRO_FEATURES = [
  'Watchlist alerts on saved tools',
  'A weekly deep-dive market report',
  'The full archive of The Signal',
  'Unlimited saves and stacks',
  'No ads',
  'Early access to the Agents marketplace',
]

type Cell = string | boolean
// [feature, free, pro, differs]
const ROWS: [string, Cell, Cell, boolean][] = [
  ['Tool directory', true, true, false],
  ['Local Fit: score, all 5 checks and notes', true, true, false],
  ['The Signal, today’s edition, on the site or by email', true, true, false],
  ['Watchlist alerts on saved tools', false, true, true],
  ['Weekly deep-dive market report', false, true, true],
  ['Archive of The Signal', 'Last 7 days', 'Full archive', true],
  ['Saves: tools, stacks and stories', '20 saves', 'Unlimited', true],
  ['Ads', 'Sponsored spots, always labelled', 'No ads', true],
  ['Agents marketplace', 'When it opens', 'Early access', true],
  ['Company and GSTIN saved for your invoice', false, true, true],
]

const FAQ: [string, string][] = [
  ['Can I cancel any time?', '[ANSWER: HOW TO CANCEL, AND WHAT HAPPENS TO PRO ACCESS UNTIL THE PERIOD ENDS]'],
  ['Can I get a refund?', '[ANSWER: REFUND TERMS FOR ANNUAL AND MONTHLY]'],
  ['Is there a student price?', '[ANSWER: STUDENT PRICE AND HOW WE VERIFY]'],
  ['Can I pay for my whole team?', '[ANSWER: TEAM BILLING, ONE INVOICE, MINIMUM SEATS]'],
  ['What do you do with my data?', '[ANSWER: WHAT WE STORE, WHERE IT IS STORED, WHAT WE NEVER SELL]'],
]

const SECTION_LABEL = 'font-mono text-label font-medium uppercase text-text-muted'

function CellValue({ value, onInk }: { value: Cell; onInk?: boolean }) {
  if (value === true) return <Icon name="check" size={18} strokeWidth={2} label="Included" className="align-[-4px]" />
  if (value === false)
    return (
      <span className={`font-mono ${onInk ? 'text-sand-400' : 'text-ink-600'}`} aria-label="Not included">
        —
      </span>
    )
  return <>{value}</>
}

function Plans({ billing, market }: { billing: BillingPlan; market: { id: string; name: string } }) {
  const [joining, setJoining] = useState(false)
  const getProRef = useRef<HTMLButtonElement>(null)
  const annual = billing === 'annual'

  function openWaitlist() {
    setJoining(true)
    track('waitlist_click', { source: 'pricing', plan: billing })
    track('waitlist_opened', { source: 'pricing', plan: billing })
  }

  // Every "Get Pro" button on the site links to /pricing?waitlist=1: open the form straight away.
  // The form moves focus to its email field, which scrolls it into view.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('waitlist') === '1') {
      setJoining(true)
      track('waitlist_opened', { source: 'get_pro_link', plan: billing })
    }
  }, [])

  function closeWaitlist() {
    setJoining(false)
    requestAnimationFrame(() => getProRef.current?.focus())
  }

  return (
    <div className="grid items-stretch gap-3 pt-6 md:grid-cols-[5fr_7fr] md:gap-5 md:pt-9">
      {/* Free */}
      <div className="order-2 flex flex-col gap-5 rounded-lg border-hairline border-border-hairline bg-surface-raised px-5 py-6 md:order-1 md:p-7">
        <span className="font-display text-xl font-bold tracking-title text-text-strong">Free</span>
        <div className="grid gap-1.5">
          <span className="font-mono text-[40px] font-medium leading-none tracking-tight">₹0</span>
          <p className="text-[13.5px] text-text-muted">No card needed.</p>
        </div>
        <p className="text-pretty text-[15px] leading-snug text-ink-700">For reading the news and finding a tool that works where you are.</p>
        <Button variant="secondary" block href="/news">
          Keep reading free
        </Button>
        <ul className="flex flex-col gap-2.5 border-t-hairline border-border-hairline pt-4 text-[14.5px]">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Icon name="check" size={18} strokeWidth={2} className="mt-px shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Pro, with Expense it attached underneath */}
      <div className="order-1 flex min-w-0 flex-col md:order-2">
        <div id="pro" className="flex scroll-mt-24 flex-col gap-5 rounded-t-lg border-hairline border-ink-900 bg-surface-inverse px-5 py-6 text-cream-200 md:p-7">
          <div className="flex min-h-[26px] items-center justify-between gap-2">
            <span className="font-display text-xl font-bold tracking-title text-cream-200">Pro</span>
            <Tag size="sm">Founding price</Tag>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="whitespace-nowrap font-mono text-[40px] font-medium leading-none tracking-tight text-cream-200">
                {annual ? PRO_PRICE.annual : PRO_PRICE.monthly}
              </span>
              <span className="text-sm text-sand-400">{annual ? '/year' : '/month'}</span>
            </div>
            <p className="text-[13.5px] text-sand-400">
              {annual
                ? `~${PRO_PRICE.annualPerMonth}/mo · 2 months free · billed once a year`
                : `Billed every month · annual is ${PRO_PRICE.annual}, 2 months free`}
            </p>
          </div>
          <p className="text-pretty text-[15px] leading-snug text-sand-300">
            For founders and builders who choose tools for a team and want to know the moment one changes.
          </p>
          {joining ? (
            <ProWaitlistForm plan={billing} market={market.id} onCancel={closeWaitlist} />
          ) : (
            <div className="grid gap-2">
              <button
                ref={getProRef}
                type="button"
                onClick={openWaitlist}
                className="inline-flex min-h-hit-min w-full items-center justify-center rounded-pill bg-cream-200 px-[22px] font-body text-[15px] font-semibold text-ink-900 outline-none transition-colors duration-fast hover:bg-paper-0 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring-inverse focus-visible:outline-offset-2"
              >
                {annual ? 'Get Pro, annual' : 'Get Pro, monthly'}
              </button>
              <p className="text-center text-[13px] leading-snug text-sand-400">
                {market.id !== 'in' ? `Priced for India (₹) until we price ${market.name}.` : 'Receipt with every payment.'}
              </p>
            </div>
          )}
          <ul className="grid gap-2.5 border-t-hairline border-ink-700 pt-4 text-[14.5px] md:grid-cols-2 md:gap-x-6">
            <li className="font-semibold md:col-span-2">Everything in Free, plus</li>
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Icon name="check" size={18} strokeWidth={2} className="mt-px shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <ExpenseIt plan={billing} market={market.id} />
      </div>
    </div>
  )
}

function ForReaders({ billing, market }: { billing: BillingPlan; market: { id: string; name: string } }) {
  return (
    <div>
      <Plans billing={billing} market={market} />

      <section
        aria-labelledby="founding-heading"
        className="mt-7 border-b-hairline border-t-heavy border-b-border-hairline border-t-ink-900 py-5 md:mt-9 md:py-6"
      >
        <p className={SECTION_LABEL}>Founding members</p>
        <h2 id="founding-heading" className="mt-1.5 text-pretty font-display text-title-1 font-bold text-text-strong">
          The first {FOUNDING_PLACES} Pro members keep this price for life.
        </h2>
        <p className="mt-2 text-[15px] leading-normal text-ink-700">The price you join at is the price you keep, for as long as you stay on Pro.</p>
      </section>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-b-hairline border-border-hairline py-[18px]">
        <span className={SECTION_LABEL}>Pay with</span>
        {['UPI', 'RuPay', 'Cards'].map((m) => (
          <span key={m} className="inline-flex h-8 items-center whitespace-nowrap rounded-pill border-hairline border-border-strong px-3.5 text-[13.5px] font-semibold">
            {m}
          </span>
        ))}
        <span className="inline-flex h-8 items-center whitespace-nowrap rounded-pill border-hairline border-dashed border-border-strong px-3.5 font-mono text-xs font-medium text-ink-700">
          [+ SEA METHODS IF SUPPORTED]
        </span>
        <span className="basis-full text-[13.5px] text-ink-700 md:ml-auto md:basis-auto">
          Annual is one payment a year, so there is no monthly UPI autopay to approve.
        </span>
      </div>

      <section aria-labelledby="compare-plans" className="pt-10 md:pt-14">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="compare-plans" className="font-display text-title-1 font-bold text-text-strong">
            Free and Pro, side by side
          </h2>
          <span className="text-[14.5px] text-ink-700">Rows in bold are where Pro differs.</span>
        </div>
        <table className="w-full border-collapse border-t-heavy border-ink-900 text-sm md:text-[15.5px]">
          <thead>
            <tr>
              <th scope="col" className="w-[40%] border-b-hairline border-border-hairline py-3 pr-2.5 text-left align-top md:w-[38%] md:py-[18px] md:pr-5">
                <span className={SECTION_LABEL}>What you get</span>
              </th>
              <th scope="col" className="w-[28%] border-b-hairline border-border-hairline px-2.5 py-3 text-left align-top font-display text-base font-bold md:w-[26%] md:px-5 md:py-[18px] md:text-lg">
                Free
              </th>
              <th scope="col" className="border-b-hairline border-border-hairline bg-surface-raised px-2.5 py-3 text-left align-top font-display text-base font-bold md:px-5 md:py-[18px] md:text-lg">
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([feature, free, pro, differs]) => (
              <tr key={feature}>
                <th
                  scope="row"
                  className={`border-b-hairline border-border-hairline py-3 pr-2.5 text-left align-top leading-snug md:py-4 md:pr-5 ${differs ? 'font-bold' : 'font-medium'}`}
                >
                  {feature}
                </th>
                <td className="border-b-hairline border-border-hairline px-2.5 py-3 align-top leading-snug text-ink-700 md:px-5 md:py-4">
                  <CellValue value={free} />
                </td>
                <td
                  className={`border-b-hairline px-2.5 py-3 align-top leading-snug md:px-5 md:py-4 ${
                    differs ? 'border-ink-700 bg-ink-900 font-semibold text-cream-200' : 'border-border-hairline bg-surface-raised'
                  }`}
                >
                  <CellValue value={pro} onInk={differs} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto max-w-[800px] pb-10 pt-10 md:pb-[72px] md:pt-16">
        <h2 id="faq-heading" className="font-display text-title-1 font-bold text-text-strong">
          Questions before you pay
        </h2>
        <div className="mt-4 border-t-heavy border-ink-900">
          {FAQ.map(([q, a], i) => (
            <details key={q} open={i === 0} className="group border-b-hairline border-border-hairline">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-2 font-display text-lg font-bold tracking-title outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring md:min-h-16 md:text-xl [&::-webkit-details-marker]:hidden">
                {q}
                <Icon name="chevron-down" size={20} className="shrink-0 transition-transform duration-base group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <p className="pb-6 font-mono text-[12.5px] leading-normal text-ink-700 md:pr-12">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

export function PricingView() {
  const { market: marketId, resolved } = useMarket()
  const market = MARKETS.find((m) => m.id === marketId) ?? MARKETS[0]
  const [audience, setAudience] = useState<Audience>('readers')
  const [billing, setBilling] = useState<BillingPlan>('annual')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // ?for=companies opens the companies side (linked from elsewhere on the site).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // ?waitlist=1 needs the readers side, where the Pro card is.
    if (params.get('for') === 'companies' && params.get('waitlist') !== '1') setAudience('companies')
  }, [])

  function choose(next: Audience) {
    setAudience(next)
    const url = new URL(window.location.href)
    if (next === 'companies') url.searchParams.set('for', 'companies')
    else url.searchParams.delete('for')
    window.history.replaceState(null, '', url)
  }

  function onTabKey(e: React.KeyboardEvent, index: number) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const last = AUDIENCES.length - 1
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? last : (index + (e.key === 'ArrowLeft' ? -1 : 1) + AUDIENCES.length) % AUDIENCES.length
    choose(AUDIENCES[next].id)
    tabRefs.current[next]?.focus()
  }

  const readers = audience === 'readers'

  return (
    <div className="mx-auto max-w-container px-4 md:px-6">
      <div className="pt-5 md:pt-10">
        <div
          role="tablist"
          aria-label="Who is this for"
          className="grid grid-cols-2 gap-1 rounded-pill border-hairline border-ink-900 bg-surface-raised p-1 sm:inline-flex"
        >
          {AUDIENCES.map((a, i) => {
            const selected = audience === a.id
            return (
              <button
                key={a.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                id={`tab-${a.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${a.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(a.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`min-h-hit-min whitespace-nowrap rounded-pill px-1.5 font-display text-[13.5px] font-bold tracking-tight outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 sm:px-5 sm:text-[15px] ${
                  selected ? 'bg-ink-900 text-cream-200' : 'text-ink-700 hover:text-text-strong'
                }`}
              >
                {a.label}
              </button>
            )
          })}
        </div>
      </div>

      <div id={`panel-${audience}`} role="tabpanel" aria-labelledby={`tab-${audience}`}>
        {readers ? (
          <>
            <header className="mt-6 grid gap-5 md:mt-7 md:flex md:items-end md:justify-between md:gap-8">
              <div>
                <h1 className="max-w-[820px] font-display text-display-xl font-extrabold text-text-strong">Free to read. Pro when you build.</h1>
                <p className="mt-3 max-w-[620px] text-pretty text-[17px] leading-normal text-ink-700 md:mt-4 md:text-[19px]">
                  Prices in ₹. Pay by UPI or card.
                </p>
              </div>
              <div className="grid justify-items-start gap-2 pb-1 md:justify-items-end">
                <BillingToggle value={billing} onChange={setBilling} />
                <span className="font-mono text-[12.5px] text-ink-700 md:whitespace-nowrap">2 months free on annual · one payment, no monthly autopay</span>
              </div>
            </header>
            {resolved && market.id !== 'in' && (
              <p className="mt-5 flex max-w-[620px] items-start gap-2.5 rounded-md border-hairline border-border-strong px-4 py-3 text-[14.5px]">
                <Icon name="info" size={18} className="mt-0.5 shrink-0" />
                <span>Priced for India (₹) until we price {market.name}.</span>
              </p>
            )}
            <ForReaders billing={billing} market={market} />
          </>
        ) : (
          <ForCompanies />
        )}
      </div>
    </div>
  )
}
