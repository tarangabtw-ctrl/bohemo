'use client'

import { useEffect } from 'react'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

interface Props {
  count: number
  slugs: string[]
}

export default function CompareAnalytics({ count, slugs }: Props) {
  // fires once when the compare page loads with a valid selection
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    window.posthog?.capture('tools_compare_view', { count, slugs })
  }, [])

  return null
}
