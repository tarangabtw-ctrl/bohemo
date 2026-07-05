'use client'

import { useState } from 'react'
import Link from 'next/link'

export function HomeNav() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <nav className={navOpen ? 'nav-menu-open' : undefined}>
      <a href="/" className="nav-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo.png" alt="bohemo." />
        <span className="nav-wordmark">bohemo.</span>
      </a>
      <ul className={`nav-links${navOpen ? ' nav-open' : ''}`}>
        <li><a href="#platform" onClick={() => setNavOpen(false)}>Platform</a></li>
        <li>
          <Link href="/tools" onClick={() => setNavOpen(false)}>Tools</Link>
        </li>
        <li>
          <Link href="/news" onClick={() => setNavOpen(false)}>News</Link>
        </li>
        <li><a href="#newsletter" onClick={() => setNavOpen(false)}>Newsletter</a></li>
        <li>
          <a href="#newsletter" className="nav-cta" onClick={() => setNavOpen(false)}>
            Join the waitlist
          </a>
        </li>
      </ul>
      <button
        className="nav-hamburger"
        onClick={() => setNavOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={navOpen}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  )
}
