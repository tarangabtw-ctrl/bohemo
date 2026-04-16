import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SiteShell from './SiteShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'bohemo. — AI tools & news for India and Southeast Asia',
  description:
    'Discover the best AI tools and stay up to date with AI news — curated for India and Southeast Asia.',
  icons: {
    icon: '/assets/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
