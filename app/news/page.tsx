import { getEditionIndex, getEditionStories, getNews, getToolsBySlug } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { addDays, formatEditionDate, groupEditions, isFreeEdition, todayIST, totalMinutes } from '@/lib/edition'
import { EditionReader } from '@/components/news/EditionReader'
import { EditionProgress } from '@/components/news/EditionProgress'
import { EditionTime } from '@/components/news/EditionTime'
import { NewsRail } from '@/components/news/NewsRail'
import { StoryItem } from '@/components/news/StoryItem'
import { EmptyState } from '@/components/EmptyState'

// A new edition lands every morning; don't freeze this page at build time.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'The Signal — Bohemo',
  description: 'The Signal: seven AI stories a day for India and Southeast Asia, with why each one matters. Lands at 8:00 IST.',
  path: '/news',
})

const EDITION_SIZE = 7

export default async function NewsPage() {
  const today = todayIST()
  const editions = groupEditions(await getEditionIndex())
  const todays = editions.find((e) => e.date === today)
  const latest = todays ?? editions[0]

  // Today's edition, else the latest one. With no editions at all, show the latest stories instead.
  const stories = latest ? await getEditionStories(latest.date) : (await getNews()).slice(0, EDITION_SIZE)
  const toolSlugs = Array.from(new Set(stories.flatMap((s) => s.tools_mentioned)))
  const tools = await getToolsBySlug(toolSlugs)

  const previous = editions.find((e) => e.date < today)
  const past = editions
    .filter((e) => e.date !== latest?.date && isFreeEdition(e.date, today))
    .slice(0, 3)
    .map((e) => ({ date: e.date, number: e.number, count: e.stories.length, lead: e.stories[0]?.title ?? '' }))
  const editionNumber = todays?.number ?? (editions[0]?.number ?? 0) + 1
  const latestIsYesterday = latest?.date === addDays(today, -1)

  return (
    <div className="mx-auto max-w-container px-4 md:px-6">
      <header className="pt-8 md:pt-12">
        <p className="font-mono text-label font-medium uppercase text-text-muted">
          Edition #{editionNumber} · {formatEditionDate(today)}
          {!todays && ' · not out yet'}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h1 className="font-display text-display-xl font-extrabold text-text-strong">The Signal</h1>
          {todays && (
            <div className="flex gap-7 pb-3">
              <div className="grid gap-0.5">
                <span className="font-mono text-[26px] font-medium leading-tight tracking-title">{stories.length}</span>
                <span className="font-mono text-label font-medium uppercase text-text-muted">Stories</span>
              </div>
              <div className="grid gap-0.5">
                <span className="font-mono text-[26px] font-medium leading-tight tracking-title">{totalMinutes(stories)}</span>
                <span className="font-mono text-label font-medium uppercase text-text-muted">Min to read</span>
              </div>
            </div>
          )}
        </div>

        {!todays && (
          <div className="mt-8 grid justify-items-start gap-4 border-t-heavy border-ink-900 pb-10 pt-9">
            <EditionProgress
              total={EDITION_SIZE}
              done={0}
              label={
                <span>
                  <b>0 of {EDITION_SIZE}</b> · lands at <EditionTime />
                </span>
              }
            />
            <h2 className="max-w-[760px] font-display text-display-l font-extrabold text-text-strong">
              Today&apos;s edition lands at{' '}
              <span className="whitespace-nowrap">
                <EditionTime />.
              </span>
            </h2>
            <p className="max-w-[560px] text-pretty text-body-lg text-ink-700">
              One edition a day. Seven stories, then you&apos;re done.
              {latest ? ` ${latestIsYesterday ? 'Yesterday’s' : 'The latest'} is below if you missed it.` : ''}
            </p>
          </div>
        )}
      </header>

      <div className="grid items-start gap-x-20 pb-12 md:grid-cols-[minmax(0,760px)_minmax(0,1fr)] md:pb-16">
        <div className="min-w-0">
          {todays ? (
            <EditionReader stories={stories} tools={tools} nextDate={addDays(today, 1)} live previous={
              previous && { date: previous.date, number: previous.number, count: previous.stories.length }
            } />
          ) : stories.length === 0 ? (
            <EmptyState title="No stories yet." body="The first edition of The Signal is on its way. We'd rather show you nothing than show you junk." />
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-hairline border-border-strong pb-3 pt-6">
                <h2 className="font-display text-title-2 font-bold text-text-strong">
                  {latest ? (latestIsYesterday ? 'Yesterday’s edition' : 'Latest edition') : 'Latest stories'}
                </h2>
                <span className="font-mono text-[12.5px] text-ink-700">
                  {latest && `Edition #${latest.number} · ${formatEditionDate(latest.date, false)} · `}
                  {stories.length} {stories.length === 1 ? 'story' : 'stories'} · {totalMinutes(stories)} min
                </span>
              </div>
              {latest ? (
                <EditionReader stories={stories} tools={tools} nextDate={addDays(today, 1)} live={false} />
              ) : (
                <ol className="list-none">
                  {stories.map((s) => (
                    <StoryItem key={s.id} story={s} tools={tools} />
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
        <NewsRail
          tools={tools}
          toolsTitle={todays ? 'Tools in today’s edition' : latest ? 'Tools in that edition' : 'Tools in these stories'}
          past={past}
        />
      </div>
    </div>
  )
}
