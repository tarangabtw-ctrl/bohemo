'use client'

import type { ReactNode } from 'react'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

interface Props {
  location: 'nav' | 'hero'
  className?: string
  children: ReactNode
}

export default function WaitlistButton({ location, className, children }: Props) {
  return (
    <a
      href="#newsletter"
      className={className}
      onClick={() => {
        window.posthog?.capture('waitlist_click', { location })
      }}
    >
      {children}
    </a>
  )
}
