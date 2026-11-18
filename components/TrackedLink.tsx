'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'

interface TrackedLinkProps {
  href: string
  event: string
  props?: Record<string, unknown>
  className?: string
  children: React.ReactNode
}

/** A Next.js Link that sends one PostHog event when clicked. For server components. */
export function TrackedLink({ href, event, props, className, children }: TrackedLinkProps) {
  return (
    <Link href={href} className={className} onClick={() => track(event, props)}>
      {children}
    </Link>
  )
}
