'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { Icon } from './Icon'
import { Button } from './Button'
import { MarketPicker } from './MarketPicker'
import { useMarket } from './MarketProvider'

const LINKS = [
  { id: 'tools', label: 'Tools', href: '/tools' },
  { id: 'news', label: 'News', href: '/news' },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
]

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return scrolled
}

function activeId(pathname: string) {
  if (pathname === '/saved') return 'saved'
  if (pathname === '/sign-in') return 'sign-in'
  const match = LINKS.find((l) => pathname === l.href || pathname.startsWith(l.href + '/'))
  return match?.id
}

export function Nav() {
  const scrolled = useScrolled()
  const pathname = usePathname()
  const current = activeId(pathname)
  const { market, setMarket } = useMarket()
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = (id: string) =>
    `inline-flex min-h-hit-min items-center whitespace-nowrap rounded-pill px-4 text-[15px] font-medium no-underline transition-colors duration-fast focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
      id === current
        ? 'bg-ink-900 text-cream-200 hover:bg-ink-900 hover:text-cream-200'
        : 'text-ink-700 hover:bg-cream-300 hover:text-text-strong'
    }`

  return (
    <header
      className={`sticky top-0 z-30 border-border-hairline bg-surface-page transition-[height,border-width] duration-base ease-out motion-reduce:transition-none ${
        scrolled ? 'border-b-heavy' : 'border-b-hairline'
      }`}
    >
      <div
        className={`mx-auto flex max-w-container items-center gap-3 pl-4 pr-2 transition-[height] duration-base ease-out motion-reduce:transition-none md:gap-5 md:px-6 ${
          scrolled ? 'h-[60px]' : 'h-nav-h'
        }`}
      >
        <Link
          href="/"
          aria-label="Bohemo home"
          className="flex shrink-0 items-center outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
        >
          <span className="md:hidden">
            <Logo variant="lockup" size={26} />
          </span>
          <span className="hidden md:block">
            <Logo variant="lockup" size={scrolled ? 26 : 30} />
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.id} href={l.href} aria-current={l.id === current ? 'page' : undefined} className={linkClass(l.id)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Decorative search field — opens command search in a later task */}
        <div className="ml-auto hidden max-w-[300px] flex-1 md:flex">
          <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-pill border-thin border-border-strong bg-surface-raised px-3.5 text-text-muted">
            <Icon name="search" size={17} />
            <span className="sr-only">Search tasks, tools and stories</span>
            <input
              className="h-full min-w-0 flex-1 bg-transparent font-body text-sm text-text-strong outline-none placeholder:text-ink-600"
              placeholder="Search tasks, tools and stories"
              readOnly
            />
            <span className="rounded-xs bg-cream-300 px-2 font-mono text-xs text-ink-700">⌘K</span>
          </label>
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0 md:gap-2">
          <div className="md:hidden">
            <Button variant="ghost" icon="search" label="Search" />
          </div>
          <MarketPicker value={market} onChange={setMarket} align="end" />
          <span className="hidden md:block">
            <Link
              href="/saved"
              aria-current={current === 'saved' ? 'page' : undefined}
              className={`${linkClass('saved')} gap-1.5`}
            >
              <Icon name="bookmark" size={18} />
              Saved
            </Link>
          </span>
          <span className="hidden md:block">
            <Link href="/sign-in" aria-current={current === 'sign-in' ? 'page' : undefined} className={linkClass('sign-in')}>
              Sign in
            </Link>
          </span>
          <div className="hidden md:block">
            <Button href="/pricing">Get Pro</Button>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              icon={menuOpen ? 'x' : 'menu'}
              label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            />
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="grid gap-1 border-t-hairline border-border-hairline px-4 py-2 pb-4 md:hidden" aria-label="More">
          <Link href="/pricing" className={linkClass('pricing')} onClick={() => setMenuOpen(false)}>
            Pricing
          </Link>
          <Link href="/saved" className={linkClass('saved')} onClick={() => setMenuOpen(false)}>
            Saved
          </Link>
          <Link href="/sign-in" className={linkClass('sign-in')} onClick={() => setMenuOpen(false)}>
            Sign in
          </Link>
          <div className="pt-1">
            <Button href="/pricing" block onClick={() => setMenuOpen(false)}>
              Get Pro
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}
