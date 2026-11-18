'use client'

import { editionTimeFor } from '@/lib/edition'
import { useMarket } from '../MarketProvider'

interface EditionTimeProps {
  /** 'both' → "9:30 WIB", 'time' → "9:30", 'zone' → "WIB". */
  show?: 'both' | 'time' | 'zone'
}

/** When 8:00 IST lands in the reader's market timezone. */
export function EditionTime({ show = 'both' }: EditionTimeProps) {
  const { market } = useMarket()
  const { time, tz } = editionTimeFor(market)
  return <>{show === 'time' ? time : show === 'zone' ? tz : `${time} ${tz}`}</>
}
