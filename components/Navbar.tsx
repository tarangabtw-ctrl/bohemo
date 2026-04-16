'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Tools', href: '/tools' },
  { label: 'News', href: '/news' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[rgba(13,13,13,0.10)]"
      style={{ backgroundColor: 'rgba(240,237,230,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-ink"
        >
          bohemo.
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-ink text-cream'
                  : 'text-secondary hover:bg-cream-dark'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="/#newsletter"
            className="ml-2 rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-cream hover:bg-secondary transition-colors"
          >
            Join waitlist
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col justify-center gap-1.5 p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`block h-0.5 w-5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-[rgba(13,13,13,0.10)] bg-cream px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-ink text-cream'
                  : 'text-secondary hover:bg-cream-dark'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="/#newsletter"
            onClick={() => setOpen(false)}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream text-center mt-1"
          >
            Join waitlist
          </a>
        </div>
      )}
    </header>
  )
}
