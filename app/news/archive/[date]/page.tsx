import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getEditionIndex, getEditionStories, getToolsBySlug } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { addDays, formatEditionDate, groupEditions, isFreeEdition, todayIST, totalMinutes } from '@/lib/edition'
import { EditionReader } from '@/components/news/EditionReader'
import { NewsRail } from '@/components/news/NewsRail'
import { ProGate } from '@/components/news/ProGate'

export const revalidate = 60

interface Props {
  params: { date: string }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!DATE_RE.test(params.date)) return { title: 'Edition not found — Bohemo' }
  return buildMetadata({
    title: `The Signal, ${formatEditionDate(params.date)} — Bohemo`,
    description: `The Signal for ${formatEditionDate(params.date)}: the day's AI stories for India and Southeast Asia, with why each one matters.`,
    path: `/news/archive/${params.date}`,
  })
}

export default async function EditionPage({ params }: Props) {
  if (!DATE_RE.test(params.date)) notFound()
  const today = todayIST()
  if (params.date === today) redirect('/news')

  const editions = groupEditions(await getEditionIndex())
  const edition = editions.find((e) => e.date === params.date)
  if (!edition) notFound()

  const free = isFreeEdition(edition.date, today)
  const stories = free ? await getEditionStories(edition.date) : []
  const tools = await getToolsBySlug(Array.from(new Set(stories.flatMap((s) => s.tools_mentioned))))
  const past = editions
    .filter((e) => e.date !== edition.date && e.date !== today && isFreeEdition(e.date, today))
    .slice(0, 3)
    .map((e) => ({ date: e.date, number: e.number, count: e.stories.length, lead: e.stories[0]?.title ?? '' }))

  return (
    <div className="mx-auto max-w-container px-4 md:px-6">
      <header className="pt-2 md:pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[13px] text-ink-700">
            <li>
              <Link href="/news" className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline">
                News
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/news/archive" className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline">
                Archive
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-text-strong">
              Edition #{edition.number}
            </li>
          </ol>
        </nav>
        <p className="mt-3 font-mono text-label font-medium uppercase text-text-muted">
          Edition #{edition.number} · {formatEditionDate(edition.date)}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h1 className="font-display text-display-xl font-extrabold text-text-strong">The Signal</h1>
          <div className="flex gap-7 pb-3">
            <div className="grid gap-0.5">
              <span className="font-mono text-[26px] font-medium leading-tight tracking-title">{edition.stories.length}</span>
              <span className="font-mono text-label font-medium uppercase text-text-muted">Stories</span>
            </div>
            <div className="grid gap-0.5">
              <span className="font-mono text-[26px] font-medium leading-tight tracking-title">{totalMinutes(edition.stories)}</span>
              <span className="font-mono text-label font-medium uppercase text-text-muted">Min to read</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-x-20 pb-12 md:grid-cols-[minmax(0,760px)_minmax(0,1fr)] md:pb-16">
        <div className="min-w-0">
          {free ? (
            <EditionReader stories={stories} tools={tools} nextDate={addDays(edition.date, 1)} live={false} />
          ) : (
            <div className="mt-6">
              <ProGate />
            </div>
          )}
        </div>
        <NewsRail tools={tools} toolsTitle="Tools in this edition" past={past} />
      </div>
    </div>
  )
}
