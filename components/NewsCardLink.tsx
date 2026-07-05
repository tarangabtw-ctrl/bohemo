'use client'

import type { ReactNode } from 'react'

// Project uses PostHog via CDN script (window.posthog); no React package needed
declare const window: Window & { posthog?: { capture: (event: string, props?: object) => void } }

interface Props {
  href: string
  articleTitle: string
  region: string
  className?: string
  children: ReactNode
}

export default function NewsCardLink({ href, articleTitle, region, className, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        window.posthog?.capture('news_article_click', { article_title: articleTitle, region })
      }}
    >
      {children}
    </a>
  )
}
