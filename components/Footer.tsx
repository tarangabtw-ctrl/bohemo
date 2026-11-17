import Link from 'next/link'
import { Logo } from './Logo'
import { MARKETS } from '@/lib/markets'

interface FooterColumn {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}

export function Footer() {
  const agencyUrl = process.env.NEXT_PUBLIC_AGENCY_URL

  const columns: FooterColumn[] = [
    {
      title: 'Explore',
      links: [
        { label: 'Tools', href: '/tools' },
        { label: 'News', href: '/news' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    {
      title: 'Markets',
      links: MARKETS.map((m) => ({ label: m.name, href: `/tools?market=${m.id}` })),
    },
    {
      title: 'Bohemo',
      links: [
        { label: 'About', href: '/about' },
        { label: 'How we rate', href: '/how-we-rate' },
        agencyUrl
          ? { label: 'Visit Bohemo Agency ↗', href: agencyUrl, external: true }
          : { label: 'Talk to Bohemo Agency', href: '/get-listed?topic=agency' },
      ],
    },
    {
      title: 'Follow',
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/bohemo', external: true },
        { label: 'X', href: 'https://x.com/bohemo', external: true },
      ],
    },
  ]

  return (
    <footer className="border-t-heavy border-border-ink bg-surface-page px-4 pb-7 pt-10 md:px-6">
      <div className="mx-auto grid max-w-container gap-8">
        <div className="grid grid-cols-2 gap-7 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="lockup" size={26} />
            <p className="mt-4 max-w-[280px] font-display text-xl font-bold leading-tight tracking-title text-text-strong">
              AI that works where you work.
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title} className="flex flex-col gap-0.5">
              <span className="mb-2 font-mono text-label font-medium uppercase text-text-muted">{c.title}</span>
              {c.links.map((l) =>
                l.external ? (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center text-[15px] text-text-strong no-underline hover:underline"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="inline-flex min-h-9 items-center text-[15px] text-text-strong no-underline hover:underline"
                  >
                    {l.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t-hairline border-border-hairline pt-4 font-mono text-xs text-text-muted">
          <span>© 2026 Bohemo</span>
          <span>Edition No. [N]</span>
        </div>
      </div>
    </footer>
  )
}
