'use client'

import { useRef } from 'react'
import type { BillingPlan } from '@/lib/forms'

interface BillingToggleProps {
  value: BillingPlan
  onChange: (value: BillingPlan) => void
}

const OPTIONS: { value: BillingPlan; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

/** Monthly / annual radio group. Arrow keys move the choice, as with native radios. */
export function BillingToggle({ value, onChange }: BillingToggleProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1
    const next = (index + step + OPTIONS.length) % OPTIONS.length
    onChange(OPTIONS[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Billing period" className="inline-grid grid-cols-2 gap-1 rounded-pill border-hairline border-border-hairline bg-surface-inset p-1">
      {OPTIONS.map((o, i) => {
        const checked = value === o.value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`inline-flex min-h-hit-min items-center justify-center whitespace-nowrap rounded-pill px-[18px] font-body text-sm font-semibold outline-none transition-colors duration-base ease-out motion-reduce:transition-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
              checked ? 'bg-ink-900 text-cream-200' : 'text-ink-700 hover:text-text-strong'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
