'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { MARKETS } from '@/lib/markets'

const STORAGE_KEY = 'bohemo:market'

const TIMEZONE_MARKET: Record<string, string> = {
  'Asia/Kolkata': 'in',
  'Asia/Calcutta': 'in',
  'Asia/Jakarta': 'id',
  'Asia/Pontianak': 'id',
  'Asia/Makassar': 'id',
  'Asia/Jayapura': 'id',
  'Asia/Ho_Chi_Minh': 'vn',
  'Asia/Saigon': 'vn',
  'Asia/Manila': 'ph',
  'Asia/Bangkok': 'th',
  'Asia/Kuala_Lumpur': 'my',
  'Asia/Kuching': 'my',
  'Asia/Singapore': 'sg',
}

const DEFAULT_MARKET = 'in'

function guessFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONE_MARKET[tz] ?? DEFAULT_MARKET
  } catch {
    return DEFAULT_MARKET
  }
}

interface MarketContextValue {
  market: string
  /** True once the real market (localStorage or timezone) has loaded on the client. */
  resolved: boolean
  setMarket: (id: string) => void
}

const MarketContext = createContext<MarketContextValue | null>(null)

export function MarketProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render both use the fixed default, so there's no
  // hydration mismatch. The real market (saved choice, else timezone guess)
  // applies right after mount.
  const [market, setMarketState] = useState(DEFAULT_MARKET)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const initial = saved && MARKETS.some((m) => m.id === saved) ? saved : guessFromTimezone()
    setMarketState(initial)
    setResolved(true)
  }, [])

  function setMarket(id: string) {
    setMarketState(id)
    setResolved(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // localStorage unavailable (private mode etc.) — keep the in-memory choice
    }
  }

  return <MarketContext.Provider value={{ market, resolved, setMarket }}>{children}</MarketContext.Provider>
}

export function useMarket() {
  const ctx = useContext(MarketContext)
  if (!ctx) throw new Error('useMarket must be used inside MarketProvider')
  return ctx
}
