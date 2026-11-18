import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PostHogScript } from '@/components/PostHogScript'
import { Nav } from '@/components/Nav'
import { BottomTabBar } from '@/components/BottomTabBar'
import { Footer } from '@/components/Footer'
import { MarketProvider } from '@/components/MarketProvider'
import { CommandSearch } from '@/components/CommandSearch'
import { OfflineBanner } from '@/components/OfflineBanner'
import { SITE_URL } from '@/lib/site'
import { poppins, notoSans, ibmPlexMono } from '@/lib/fonts'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Bohemo — AI tools & news for India and Southeast Asia',
  description:
    'Discover the best AI tools and stay up to date with AI news — curated for India and Southeast Asia.',
  icons: { icon: '/brand/bohemo-favicon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${notoSans.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-surface-page font-body text-text-body">
        <PostHogScript />
        <MarketProvider>
          <Nav />
          <OfflineBanner />
          <main className="pb-[calc(theme(spacing.tabbar-h)+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
          <Footer />
          <BottomTabBar />
          <CommandSearch />
        </MarketProvider>
      </body>
    </html>
  )
}
