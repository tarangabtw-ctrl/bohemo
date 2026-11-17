'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from './Icon'

const TABS = [
  { id: 'home', label: 'Home', icon: 'house', href: '/' },
  { id: 'tools', label: 'Tools', icon: 'layout-grid', href: '/tools' },
  { id: 'news', label: 'News', icon: 'newspaper', href: '/news' },
  { id: 'saved', label: 'Saved', icon: 'bookmark', href: '/saved' },
]

function activeId(pathname: string) {
  if (pathname === '/') return 'home'
  const match = TABS.find((t) => t.href !== '/' && (pathname === t.href || pathname.startsWith(t.href + '/')))
  return match?.id
}

export function BottomTabBar() {
  const pathname = usePathname()
  const current = activeId(pathname)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid h-tabbar-h grid-flow-col auto-cols-fr border-t-hairline border-border-hairline bg-surface-raised px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Main"
    >
      {TABS.map((t) => {
        const isCurrent = t.id === current
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isCurrent ? 'page' : undefined}
            className="flex min-h-hit-min flex-col items-center justify-center gap-0.5 font-body text-[11.5px] font-semibold text-ink-600 no-underline outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 aria-[current=page]:text-text-strong"
          >
            <span
              className={`flex h-[30px] items-center justify-center rounded-pill transition-[background-color,width] duration-base ease-out motion-reduce:transition-none ${
                isCurrent ? 'w-[60px] bg-ink-900 text-cream-200' : 'w-[52px]'
              }`}
            >
              <Icon name={t.icon} size={22} />
            </span>
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
