import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

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
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-cream font-sans text-ink">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-[rgba(13,13,13,0.10)] py-8 mt-20">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-semibold tracking-tight">bohemo.</span>
            <nav className="flex gap-6 text-sm text-muted">
              <a href="/tools" className="hover:text-ink transition-colors">Tools</a>
              <a href="/news" className="hover:text-ink transition-colors">News</a>
            </nav>
            <p className="text-xs text-muted">© 2025 bohemo. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
