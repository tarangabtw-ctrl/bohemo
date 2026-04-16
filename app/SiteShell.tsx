'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

/**
 * Conditionally renders Navbar + footer only on non-homepage routes.
 * The homepage owns its full layout (nav, content, footer) directly in page.tsx.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  if (isHome) {
    // Let the homepage render its own nav and footer
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer className="border-t border-[rgba(13,13,13,0.10)] py-8 mt-20">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold tracking-tight">bohemo.</span>
          <div className="flex gap-6 text-sm text-muted">
            <a href="/tools" className="hover:text-ink transition-colors">Tools</a>
            <a href="/news" className="hover:text-ink transition-colors">News</a>
          </div>
          <p className="text-xs text-muted">© 2025 bohemo. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
