import Link from 'next/link'
import { getNews } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { MARKETS } from '@/lib/markets'
import { formatDate } from '@/lib/utils'
import type { NewsArticle } from '@/types'
import { Tag } from '@/components/Tag'
import { Icon } from '@/components/Icon'
import { EditionTime } from '@/components/news/EditionTime'
import {
  EditorialLayout,
  EditorialSection,
  NumberedList,
  MORE_LINK,
  PROSE,
  PROSE_LINK,
} from '@/components/editorial/EditorialLayout'

export const revalidate = 3600

export const metadata = buildMetadata({
  title: 'About Bohemo',
  description:
    'Daily AI news and a tool directory for India and Southeast Asia, with every tool scored for the market you’re in. Our editorial standards, corrections and independence.',
  path: '/about',
})

const TOC = [
  { id: 'what', label: 'What Bohemo is' },
  { id: 'who', label: 'Who it’s for' },
  { id: 'standards', label: 'Editorial standards' },
  { id: 'corrections', label: 'Corrections' },
  { id: 'independence', label: 'Independence' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
]

const ROLES = ['Founders', 'Operators', 'Developers', 'Marketers', 'Students']

const RULES: [string, string][] = [
  [
    'Summaries in our own words',
    'We read the original reporting and write a short summary ourselves. We don’t copy or rewrite someone else’s article sentence by sentence.',
  ],
  [
    'Always credit and link the original',
    'Every story names the publication that reported it and links to their article, at the top and again at the end.',
  ],
  ['“Why it matters” is ours', 'The line under each story is Bohemo’s view, not the source’s. That’s why it is labelled.'],
]

const CONTACT: [string, string, string][] = [
  ['Editorial', 'Tips, story ideas and questions about a story.', '[EDITORIAL EMAIL]'],
  ['Corrections', 'Something wrong in a story.', '[CORRECTIONS EMAIL]'],
  ['Press', 'Interviews and media requests.', '[PRESS EMAIL]'],
]

const KEYS = ['Credit: who reported it, and when', 'Our summary', 'Our view, labelled', 'Link to the original']

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'the source'
  }
}

/** A real story from the news table, annotated to show how crediting works. */
function StoryExample({ story }: { story: NewsArticle }) {
  return (
    <figure
      aria-label="How a story is credited"
      className="m-0 grid gap-2.5 rounded-lg border-hairline border-border-strong bg-surface-raised px-4 py-5 md:px-7 md:py-6"
    >
      <figcaption className="mb-1 font-mono text-label font-medium uppercase text-text-muted">How a story looks</figcaption>
      <div className="flex flex-wrap items-center gap-2">
        {story.region && (
          <Tag variant="brown" size="sm">
            {story.region}
          </Tag>
        )}
        <span className="font-mono text-xs text-ink-700">
          {story.source} · {formatDate(story.published_at)}
        </span>
      </div>
      <p className="text-pretty font-display text-[21px] font-bold leading-[1.2] tracking-title text-text-strong md:text-2xl">{story.title}</p>
      {story.excerpt && <p className="text-pretty text-body leading-[1.55]">{story.excerpt}</p>}
      {story.why_it_matters && (
        <p className="text-pretty text-body-sm leading-normal text-ink-700">
          <b className="mr-1.5 font-semibold text-text-strong">Why it matters</b>
          {story.why_it_matters}
        </p>
      )}
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-hit-min items-center gap-1 justify-self-start text-[15px] font-semibold text-text-strong"
      >
        Read the original at {hostOf(story.url)}
        <Icon name="arrow-up-right" size={15} />
      </a>
      <ul
        aria-hidden="true"
        className="m-0 mt-1 grid list-none gap-2 border-t-hairline border-border-hairline p-0 pt-3.5 text-[13.5px] text-ink-700 md:flex md:flex-wrap md:gap-x-6"
      >
        {KEYS.map((k, i) => (
          <li key={k} className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full border-hairline border-ink-900 font-mono text-[11px] text-text-strong">
              {i + 1}
            </span>
            {k}
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default async function AboutPage() {
  const news = await getNews()
  // The latest story with our "Why it matters" line shows all four parts; else the latest story.
  const example = news.find((n) => n.why_it_matters) ?? news[0] ?? null
  const marketNames = MARKETS.map((m) => m.name)
  const marketList = `${marketNames.slice(0, -1).join(', ')} and ${marketNames[marketNames.length - 1]}`

  return (
    <EditorialLayout
      kicker="About Bohemo"
      title="AI that works where you work."
      sub="Daily AI news and a tool directory for India and Southeast Asia, with every tool scored for the market you’re in."
      toc={TOC}
    >
      <EditorialSection id="what" n={1} title="What Bohemo is">
        <p className={PROSE}>
          Bohemo covers AI for India and Southeast Asia: the news that matters there, and the tools that actually work there. Most AI
          coverage assumes you read in English and pay in dollars. We start from where you are.
        </p>
        <dl className="m-0 border-t-hairline border-border-strong">
          <div className="grid gap-1 border-b-hairline border-border-hairline py-3.5 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-baseline md:gap-6">
            <dt className="font-display text-lg font-bold tracking-[-0.01em]">The Signal</dt>
            <dd className="m-0 text-pretty text-body leading-normal">
              A daily edition of the AI stories that matter in your market. Read it on the site or get it by email. It lands at{' '}
              <EditionTime /> every morning.
            </dd>
            <dd className="m-0">
              <Link href="/news" className={MORE_LINK}>
                Read today’s edition →
              </Link>
            </dd>
          </div>
          <div className="grid gap-1 border-b-hairline border-border-hairline py-3.5 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-baseline md:gap-6">
            <dt className="font-display text-lg font-bold tracking-[-0.01em]">The tool directory</dt>
            <dd className="m-0 text-pretty text-body leading-normal">
              AI tools ranked by Local Fit: whether a tool speaks your language, takes your payment methods and prices in your currency.
            </dd>
            <dd className="m-0">
              <Link href="/tools" className={MORE_LINK}>
                Browse the tools →
              </Link>
            </dd>
          </div>
        </dl>
        <p className={PROSE}>
          Reading is free, and so is every Local Fit score. Pro adds alerts, the full archive and a weekly market report.{' '}
          <Link href="/pricing" className={PROSE_LINK}>
            See pricing
          </Link>
          .
        </p>
      </EditorialSection>

      <EditorialSection id="who" n={2} title="Who it’s for">
        <p className={PROSE}>
          People choosing and using AI tools for work in {marketList}. If you have ever found a good tool and then hit a dollar-only
          checkout, Bohemo is for you.
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <Tag key={r}>{r}</Tag>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection id="standards" n={3} title="Editorial standards">
        <NumberedList
          items={RULES.map(([t, d]) => (
            <>
              <b>{t}.</b> {d}
            </>
          ))}
        />
        {example && <StoryExample story={example} />}
        <p className={PROSE}>
          How we score tools is a separate set of rules.{' '}
          <Link href="/how-we-rate" className={PROSE_LINK}>
            How we rate tools
          </Link>
          .
        </p>
      </EditorialSection>

      <EditorialSection id="corrections" n={4} title="Corrections">
        <p className={PROSE}>
          When we get a fact wrong in a story, we fix it and say so. We never change a story quietly. A dated note at the end says what
          was wrong and what we changed.
        </p>
        <div aria-label="Example correction note" className="grid gap-1.5 border-l-heavy border-ink-900 py-4 pl-5">
          <p className="font-mono text-label font-medium uppercase text-text-muted">Example</p>
          <p className="font-mono text-label font-medium uppercase">Correction · [DATE]</p>
          <p className="text-pretty text-body leading-normal text-ink-700">
            An earlier version of this story said [WHAT WE GOT WRONG]. It is [WHAT IS RIGHT]. We have updated the story.
          </p>
        </div>
        <p className={PROSE}>
          Spelling and typo fixes aren’t noted. Anything that changes a fact, a number, a name or a price is. Tell us at [CORRECTIONS
          EMAIL] and an editor will reply within 3 working days.
        </p>
        <p className={PROSE}>
          Mistakes on a tool page go through “Report a mistake” on that page.{' '}
          <Link href="/how-we-rate#report" className={PROSE_LINK}>
            How reports work
          </Link>
          .
        </p>
      </EditorialSection>

      <EditorialSection id="independence" n={5} title="Independence">
        <p className="font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-text-strong md:text-[36px]">
          The Local Fit score is never for sale.
        </p>
        <p className={PROSE}>
          Bohemo is paid for by Pro members, Sponsored slots, Bohemo Verified checks and some affiliate links. Every one of those is
          labelled where you see it, and none of them can fill a dot, speed up a check or move a tool up the ranking. The Signal carries
          no sponsored stories.
        </p>
        <div className="grid justify-items-start border-t-hairline border-border-strong pt-2">
          <Link href="/how-we-rate#never" className={MORE_LINK}>
            What money can and can’t buy →
          </Link>
          <Link href="/pricing" className={MORE_LINK}>
            Why we started Bohemo: the founder’s note on Pricing →
          </Link>
        </div>
      </EditorialSection>

      <EditorialSection id="team" n={6} title="Team">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-3 md:gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid gap-1">
              <div
                aria-label="Photo placeholder"
                className="mb-2 grid aspect-[4/5] place-items-center rounded-md border-hairline border-dashed border-border-strong bg-surface-inset"
              >
                <span className="rounded-xs bg-surface-page px-2 py-0.5 font-mono text-xs text-ink-700">[PHOTO]</span>
              </div>
              <p className="text-body font-bold">[NAME]</p>
              <p className="font-mono text-[12.5px] text-ink-700">[ROLE · BASED IN]</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-body-sm text-ink-700">[TEAM: WHO WRITES, WHO SCORES, WHERE WE WORK FROM]</p>
      </EditorialSection>

      <EditorialSection id="contact" n={7} title="Contact">
        <dl className="m-0 border-t-heavy border-ink-900">
          {CONTACT.map(([t, d, e]) => (
            <div
              key={t}
              className="grid gap-1 border-b-hairline border-border-hairline py-3.5 md:min-h-16 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-center md:gap-6 md:py-2.5"
            >
              <dt className="text-body font-bold">{t}</dt>
              <dd className="m-0 text-[15.5px] leading-snug text-ink-700">{d}</dd>
              <dd className="m-0 font-mono text-[13.5px] text-text-strong">{e}</dd>
            </div>
          ))}
          <div className="grid gap-1 border-b-hairline border-border-hairline py-3.5 md:min-h-16 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-center md:gap-6 md:py-2.5">
            <dt className="text-body font-bold">For AI companies</dt>
            <dd className="m-0 text-[15.5px] leading-snug text-ink-700">Listings, Featured placement and Bohemo Verified.</dd>
            <dd className="m-0">
              <Link href="/get-listed#talk" className={MORE_LINK}>
                Talk to us →
              </Link>
            </dd>
          </div>
        </dl>
      </EditorialSection>
    </EditorialLayout>
  )
}
