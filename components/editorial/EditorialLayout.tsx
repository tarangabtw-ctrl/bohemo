// Shared frame for the footer pages (/how-we-rate, /about): header, an "On this
// page" rail on desktop (jump chips on mobile), and numbered sections.

export interface TocItem {
  id: string
  label: string
}

interface EditorialLayoutProps {
  kicker: string
  title: string
  sub: string
  updated?: string
  toc: TocItem[]
  children: React.ReactNode
}

/** Body paragraph style used inside sections. */
export const PROSE = 'max-w-container-read text-pretty text-[17px] leading-[1.55] text-text-strong md:text-body-lg md:leading-[1.6]'
export const PROSE_LINK = 'text-text-strong underline underline-offset-[3px] hover:text-text-link'
export const MORE_LINK =
  'inline-flex min-h-hit-min items-center text-[15px] font-semibold text-text-strong no-underline hover:underline focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring'
export const H3 = 'mt-3 font-display text-[19px] font-bold tracking-[-0.01em] text-text-strong'

export function EditorialLayout({ kicker, title, sub, updated, toc, children }: EditorialLayoutProps) {
  return (
    <div>
      <header className="mx-auto max-w-container px-4 pt-7 md:px-6 md:pt-12">
        <p className="font-mono text-label font-medium uppercase text-text-muted">{kicker}</p>
        <h1 className="mt-2 text-balance font-display text-display-xl font-extrabold text-text-strong md:mt-3">{title}</h1>
        <p className="mt-3 max-w-[720px] text-pretty text-[17px] leading-normal text-ink-700 md:text-xl">{sub}</p>
        {updated && <p className="mt-4 font-mono text-[12.5px] text-ink-700">{updated}</p>}
      </header>

      <div className="mx-auto grid max-w-container items-start gap-0 px-4 pb-10 pt-6 md:px-6 md:pb-[72px] md:pt-10 lg:grid-cols-[240px_minmax(0,760px)] lg:gap-20">
        {/* Mobile and tablet: jump chips */}
        <nav aria-label="On this page" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {toc.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="inline-flex min-h-hit-min shrink-0 items-center whitespace-nowrap rounded-pill border-thin border-border-strong bg-surface-raised px-4 text-sm font-medium text-text-strong no-underline outline-none hover:border-ink-900 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
            >
              {t.label}
            </a>
          ))}
        </nav>

        {/* Desktop: sticky rail */}
        <aside className="sticky top-24 hidden gap-2 lg:grid">
          <p className="font-mono text-label font-medium uppercase text-text-muted">On this page</p>
          <nav aria-label="On this page">
            <ol className="m-0 list-none border-t-heavy border-ink-900 p-0">
              {toc.map((t, i) => (
                <li key={t.id} className="grid grid-cols-[28px_minmax(0,1fr)] items-center border-b-hairline border-border-hairline">
                  <span className="font-mono text-[12.5px] text-ink-700">{String(i + 1).padStart(2, '0')}</span>
                  <a
                    href={`#${t.id}`}
                    className="inline-flex min-h-hit-min items-center text-[15px] font-medium text-text-strong no-underline hover:underline focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="grid">{children}</div>
      </div>
    </div>
  )
}

interface EditorialSectionProps {
  id: string
  n: number
  title: string
  children: React.ReactNode
}

/** A numbered section. The first one gets the heavy ink rule. */
export function EditorialSection({ id, n, title, children }: EditorialSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid scroll-mt-24 gap-4 border-t-hairline border-border-hairline pb-8 pt-6 first:border-t-heavy first:border-ink-900 md:gap-[18px] md:pb-10 md:pt-8"
    >
      <p className="font-mono text-[13px] font-semibold text-ink-700">{String(n).padStart(2, '0')}</p>
      <h2 id={`${id}-title`} className="-mt-3 font-display text-title-1 font-bold text-text-strong">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Numbered list with mono numbers and hairline rules. */
export function NumberedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="m-0 list-none border-t-hairline border-border-strong p-0">
      {items.map((item, i) => (
        <li
          key={i}
          className="grid grid-cols-[32px_minmax(0,1fr)] gap-2 border-b-hairline border-border-hairline py-3.5 text-body leading-normal md:grid-cols-[36px_minmax(0,1fr)]"
        >
          <span className="font-mono text-[12.5px] leading-6 text-ink-700">{String(i + 1).padStart(2, '0')}</span>
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ol>
  )
}
