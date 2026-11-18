'use client'

import { useEffect, useRef, useState } from 'react'
import { MARKETS } from '@/lib/markets'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { useMarket } from '../MarketProvider'
import { Button } from '../Button'
import { FilterChip } from '../FilterChip'
import { Icon } from '../Icon'

const DONE_KEY = 'bohemo:onboarded'
const ROLE_KEY = 'bohemo:role'
// Set by MarketProvider when the reader picks a market themselves.
const MARKET_KEY = 'bohemo:market'
const ROLES = ['Founder', 'Operator', 'Developer', 'Marketer', 'Student']
const TOAST_MS = 6000

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable: onboarding may show again next visit
  }
}

/**
 * First visit to Home: "Make Bohemo local". A bottom sheet on mobile (modal),
 * a card in the corner on desktop (doesn't block the page). No account needed.
 */
export function Onboarding() {
  const { market, resolved, setMarket } = useMarket()
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState(market)
  const [role, setRole] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Show once, and only to readers who haven't picked a market already.
  useEffect(() => {
    if (!resolved) return
    if (!read(DONE_KEY) && !read(MARKET_KEY)) {
      setPicked(market)
      setOpen(true)
    }
    // Once the reader picks a market or skips, a key is set and this never opens again.
  }, [resolved, market])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Mobile sheet is modal, so focus moves into it. The desktop card doesn't take focus from the page.
  useEffect(() => {
    if (open && mobile) panelRef.current?.querySelector<HTMLElement>('button[aria-pressed="true"]')?.focus()
  }, [open, mobile])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [toast])

  function skip() {
    write(DONE_KEY, '1')
    setOpen(false)
  }

  function done() {
    write(DONE_KEY, '1')
    if (role) write(ROLE_KEY, role)
    setMarket(picked, 'onboarding')
    setOpen(false)
    const name = MARKETS.find((m) => m.id === picked)?.name ?? 'India'
    setToast(`Showing tools and prices for ${name}.`)
  }

  function change() {
    setToast(null)
    setPicked(market)
    setOpen(true)
  }

  // The mobile sheet is modal: focus stays inside, Escape skips. On desktop, Escape also skips.
  useFocusTrap(panelRef, open && mobile, skip)
  useEffect(() => {
    if (!open || mobile) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, mobile])

  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-ink-900/45 md:hidden" aria-hidden="true" onClick={skip} />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal={mobile}
            aria-labelledby="onboarding-title"
            className="fixed inset-x-0 bottom-0 z-40 grid gap-5 rounded-t-xl bg-surface-overlay px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-overlay md:inset-x-auto md:bottom-6 md:right-6 md:w-[420px] md:gap-[18px] md:rounded-lg md:border-hairline md:border-ink-900 md:px-[22px] md:pb-[22px] md:pt-2.5"
          >
            <span className="h-1 w-10 justify-self-center rounded-pill bg-sand-400 md:hidden" aria-hidden="true" />
            <div className="flex items-center justify-between">
              <p id="onboarding-title" className="font-mono text-label font-medium uppercase text-text-muted">
                Make Bohemo local
              </p>
              <button
                type="button"
                onClick={skip}
                className="hidden min-h-hit-min items-center rounded-pill px-2 text-sm font-semibold text-text-strong underline underline-offset-4 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring md:inline-flex"
              >
                Skip
              </button>
            </div>
            <div role="group" aria-labelledby="onboarding-market">
              <h2 id="onboarding-market" className="font-display text-title-3 font-bold text-text-strong">
                Where are you building from?
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {MARKETS.map((m) => (
                  <FilterChip key={m.id} selected={picked === m.id} onClick={() => setPicked(m.id)}>
                    {m.name}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div role="group" aria-labelledby="onboarding-role">
              <h2 id="onboarding-role" className="font-display text-title-3 font-bold text-text-strong">
                What do you do?
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <FilterChip key={r} selected={role === r} onClick={() => setRole(role === r ? null : r)}>
                    {r}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Button onClick={done}>Done</Button>
              <span className="md:hidden">
                <Button variant="ghost" onClick={skip}>
                  Skip
                </Button>
              </span>
              <span className="text-body-sm text-text-muted md:text-[13px] md:leading-snug">
                No account needed.<span className="hidden md:inline"> Change it any time from the market picker.</span>
              </span>
            </div>
          </div>
        </>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-[calc(theme(spacing.tabbar-h)+16px+env(safe-area-inset-bottom))] z-40 flex justify-center md:bottom-8">
        {toast && (
          <div className="pointer-events-auto flex min-h-[52px] w-full max-w-[480px] items-center gap-3 rounded-pill bg-surface-inverse py-1.5 pl-5 pr-1.5 text-[15px] text-cream-200 shadow-overlay md:w-auto md:min-w-[420px]">
            <Icon name="circle-check" size={20} className="shrink-0 text-positive-on-ink" />
            <span className="flex-1">{toast}</span>
            <button
              type="button"
              onClick={change}
              className="inline-flex min-h-hit-min items-center rounded-pill px-3 text-sm font-semibold text-cream-200 underline underline-offset-4 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring-inverse"
            >
              Change
            </button>
          </div>
        )}
      </div>
    </>
  )
}
