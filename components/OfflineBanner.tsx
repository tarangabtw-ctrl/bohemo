'use client'

import { useEffect, useState } from 'react'
import { Icon } from './Icon'

/** A charcoal strip under the nav while the device has no connection. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  return (
    <div role="status" aria-live="polite">
      {offline && (
        <div className="bg-surface-inverse text-cream-200">
          <div className="mx-auto flex min-h-12 max-w-container items-start gap-2.5 px-4 py-3 text-[14.5px] leading-snug md:items-center md:px-6 md:text-[15px]">
            <Icon name="wifi-off" size={18} className="mt-px shrink-0 md:mt-0" />
            <span>
              <b className="font-bold">You&apos;re offline.</b> Pages already open still work. New ones load when you&apos;re back.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
