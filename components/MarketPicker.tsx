'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { MARKETS } from '@/lib/markets'

interface MarketPickerProps {
  value: string
  onChange: (id: string) => void
  align?: 'start' | 'end'
}

export function MarketPicker({ value, onChange, align = 'start' }: MarketPickerProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])
  const current = MARKETS.find((m) => m.id === value) ?? MARKETS[0]

  useEffect(() => {
    if (!open) return
    setActiveIndex(MARKETS.findIndex((m) => m.id === current.id))
    const handleClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, current.id])

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  function select(id: string) {
    onChange(id)
    setOpen(false)
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % MARKETS.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + MARKETS.length) % MARKETS.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      select(MARKETS[activeIndex].id)
    }
  }

  return (
    <div className={`relative inline-block ${align === 'end' ? 'text-right' : ''}`} ref={boxRef}>
      <button
        type="button"
        className="inline-flex min-h-hit-min items-center gap-1.5 rounded-pill border-hairline border-border-strong bg-surface-raised pl-2.5 pr-2 font-body text-sm font-semibold text-text-strong outline-none hover:border-ink-900 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 md:gap-2 md:pl-3.5 md:pr-3"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Market: ${current.name}. Prices in ${current.currency}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="globe" size={18} />
        <span className="font-mono md:hidden">{current.code}</span>
        <span className="hidden md:inline">{current.name}</span>
        <span className="font-mono text-text-muted">{current.currency}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Choose your market"
          className={`absolute top-[calc(100%+8px)] z-40 min-w-[260px] list-none rounded-lg border-hairline border-border-hairline bg-surface-overlay p-1.5 shadow-overlay ${
            align === 'end' ? 'right-0' : 'left-0'
          }`}
          onKeyDown={onListKeyDown}
        >
          {MARKETS.map((m, i) => (
            <li
              key={m.id}
              ref={(el) => {
                optionRefs.current[i] = el
              }}
              role="option"
              aria-selected={m.id === current.id}
              tabIndex={i === activeIndex ? 0 : -1}
              className="flex min-h-hit-min cursor-pointer items-center gap-2.5 rounded-sm px-3 text-[15px] text-text-strong outline-none hover:bg-cream-100 focus-visible:bg-cream-100"
              onClick={() => select(m.id)}
            >
              {m.id === current.id ? (
                <Icon name="check" size={16} strokeWidth={2.25} />
              ) : (
                <span className="w-4" aria-hidden="true" />
              )}
              <span className="flex-1">
                <span className="block">{m.name}</span>
                <span className="block text-xs font-normal text-text-muted">{m.lang}</span>
              </span>
              <span className="font-mono text-xs text-text-muted">{m.currency}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
