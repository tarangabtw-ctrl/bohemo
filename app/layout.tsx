import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { PostHogScript } from '@/components/PostHogScript'
import { SITE_URL } from '@/lib/site'

// v2 teardown: bare shell. No brand, no styling, until the new design lands.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Bohemo — AI tools & news for India and Southeast Asia',
  description:
    'Discover the best AI tools and stay up to date with AI news — curated for India and Southeast Asia.',
  icons: { icon: '/assets/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogScript />
        <header>
          <nav>
            <Link href="/">Bohemo</Link> · <Link href="/tools">Tools</Link> · <Link href="/news">News</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
