import Link from 'next/link'
import { getEditionIndex } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { formatEditionDate, groupEditions, isFreeEdition, pad2, todayIST, totalMinutes } from '@/lib/edition'
import { EditionTime } from '@/components/news/EditionTime'
import { ProGate } from '@/components/news/ProGate'
import { EmptyState } from '@/components/EmptyState'
import { Tag } from '@/components/Tag'

export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Past editions of The Signal — Bohemo',
  description: 'Every edition of The Signal, newest first. Seven AI stories a day for India and Southeast Asia.',
  path: '/news/archive',
})

export default async function ArchivePage() {
  const today = todayIST()
  const editions = groupEditions(await getEditionIndex())
  const free = editions.filter((e) => isFreeEdition(e.date, today))
  const olderCount = editions.length - free.length

  return (
    <div className="mx-auto max-w-container px-4 pb-12 md:px-6 md:pb-16">
      <header className="pt-2 md:pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 font-mono text-[13px] text-ink-700">
            <li>
              <Link href="/news" className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline">
                News
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-text-strong">
              Archive
            </li>
          </ol>
        </nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h1 className="font-display text-display-xl font-extrabold text-text-strong">Past editions</h1>
          <div className="flex gap-7 pb-3">
            <div className="grid gap-0.5">
              <span className="font-mono text-[26px] font-medium leading-tight tracking-title">{editions.length}</span>
              <span className="font-mono text-label font-medium uppercase text-text-muted">Editions</span>
            </div>
            <div className="grid gap-0.5">
              <span className="font-mono text-[26px] font-medium leading-tight tracking-title">
                <EditionTime show="time" />
              </span>
              <span className="font-mono text-label font-medium uppercase text-text-muted">
                Daily, <EditionTime show="zone" />
              </span>
            </div>
          </div>
        </div>
      </header>

      {editions.length === 0 ? (
        <EmptyState title="No editions yet." body="The archive starts with the first edition of The Signal." actionHref="/news" actionLabel="Go to The Signal" />
      ) : (
        <>
          <ol className="mt-6 list-none border-t-heavy border-ink-900">
            {free.map((e) => {
              const isToday = e.date === today
              return (
                <li key={e.date} className="border-b-hairline border-border-hairline">
                  <Link
                    href={isToday ? '/news' : `/news/archive/${e.date}`}
                    className="group grid gap-4 py-6 text-inherit no-underline hover:bg-cream-300 md:grid-cols-[220px_minmax(0,1fr)_220px] md:gap-8"
                  >
                    <span className="grid justify-items-start gap-1.5">
                      <span className="font-mono text-data-sm uppercase tracking-[0.04em] text-ink-700">Edition #{e.number}</span>
                      <b className="font-display text-title-1 font-bold text-text-strong">{formatEditionDate(e.date, false)}</b>
                      {isToday && (
                        <Tag variant="brown" size="sm">
                          Today
                        </Tag>
                      )}
                    </span>
                    <ol className="grid list-none gap-2.5">
                      {e.stories.slice(0, 2).map((s, i) => (
                        <li key={s.id} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-2">
                          <span className="font-mono text-[12.5px] leading-[21px] text-ink-700">{pad2(i + 1)}</span>
                          <span
                            className={
                              i === 0
                                ? 'text-pretty font-display text-title-2 font-bold text-text-strong group-hover:underline'
                                : 'text-pretty text-[17px] leading-snug text-ink-700'
                            }
                          >
                            {s.title}
                          </span>
                        </li>
                      ))}
                    </ol>
                    <span className="flex gap-4 font-mono text-[12.5px] text-ink-700 md:grid md:justify-items-end md:gap-1">
                      <span>
                        {e.stories.length} {e.stories.length === 1 ? 'story' : 'stories'}
                      </span>
                      <span>{totalMinutes(e.stories)} min</span>
                      <span className="mt-2 hidden font-body text-[15px] font-semibold text-text-strong md:inline">Open →</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
          <div className="mt-8">
            <ProGate olderCount={olderCount} />
          </div>
        </>
      )}
    </div>
  )
}
