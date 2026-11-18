import Link from 'next/link'
import { getTools } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import type { LocalFit } from '@/lib/localFit'
import { LocalFitMeter } from '@/components/LocalFitMeter'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { SponsoredLabel } from '@/components/SponsoredLabel'
import { Tag } from '@/components/Tag'
import { Icon } from '@/components/Icon'
import {
  EditorialLayout,
  EditorialSection,
  NumberedList,
  H3,
  MORE_LINK,
  PROSE,
  PROSE_LINK,
} from '@/components/editorial/EditorialLayout'

export const revalidate = 3600

export const metadata = buildMetadata({
  title: 'How we rate tools — Bohemo',
  description:
    'What Local Fit measures, what Bohemo Verified checks, and where money changes hands. Paying never changes a score.',
  path: '/how-we-rate',
})

const TOC = [
  { id: 'fit', label: 'Local Fit' },
  { id: 'dates', label: 'Last checked dates' },
  { id: 'verified', label: 'Bohemo Verified' },
  { id: 'money', label: 'Sponsored and affiliate' },
  { id: 'report', label: 'Report a mistake' },
  { id: 'never', label: 'What money can’t buy' },
]

// The five canonical check names (same wording as the tool page and Compare).
const CHECKS: [string, string, string][] = [
  [
    'Languages',
    'The product works in languages people there use, not only English. We name each one on the tool page.',
    'We read the product and its help pages. [WHAT COUNTS AS SUPPORTED: INTERFACE, INPUT OR OUTPUT]',
  ],
  [
    'Local payment methods',
    'You can pay with a method people there use: UPI in India, or the local wallet in each market.',
    'We check the checkout, not the marketing page. App-store billing counts; we say so.',
  ],
  [
    'Local-currency pricing',
    'There is a price in the local currency, so you know what you’ll pay before you sign up.',
    'We record the price as shown, with the plan and period.',
  ],
  [
    'Works on low-end Android and low bandwidth',
    'It is usable on an entry-level Android phone on a slow mobile connection.',
    'A hands-on test by our team on [TEST DEVICE + CONNECTION].',
  ],
  [
    'Data stored in-region',
    'Your data is stored in the market or region, not only in the US or Europe.',
    'We read the privacy policy and data-residency docs. [HOW WE CONFIRM WHEN THEY ARE UNCLEAR]',
  ],
]

const VERIFIED_CHECKS: [string, string][] = [
  ['A real company', 'The company is registered and the people behind it can be named.'],
  ['Accurate prices', 'The prices it publishes are the prices it charges.'],
  ['Works as described', 'The product does what its own pages say it does.'],
  ['A real support contact', 'There is a support address or number, and someone answers it.'],
  ['Data handling reviewed', 'We read how it says it stores and uses your data.'],
]

const REPORT_STEPS = [
  'Open “Report a mistake” on the tool page, under Local Fit.',
  'Tell us what is wrong and what is right, with a link where we can confirm it.',
  'An editor replies within 3 working days. Leave your email if you want to hear back.',
  'If we got it wrong, we fix it and log the change, with the date, in “What changed” on the tool page.',
]

const MONEY: [string, boolean][] = [
  ['Fill a Local Fit dot', false],
  ['Speed up a check', false],
  ['Change a score or a ranking', false],
  ['Hide or remove a report', false],
  ['A Sponsored slot, always labelled', true],
  ['A Bohemo Verified check of the company’s own claims', true],
]

// Example meter for "why no tool has all five yet": four filled, one empty.
const EXAMPLE_FIT: LocalFit = {
  criteria: [],
  dots: [true, true, true, true, false],
  confirmed: 4,
  notCheckedYet: 1,
}

function Dot({ on }: { on?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-[5px] h-3.5 w-3.5 rounded-full border-thin ${on ? 'border-mark-filled bg-mark-filled' : 'border-mark-empty bg-transparent'}`}
    />
  )
}

export default async function HowWeRatePage() {
  const tools = await getTools()
  // Shown only while it's true: no tool has had the hands-on low-end Android test yet.
  const noDeviceTestYet = tools.length > 0 && tools.every((t) => t.low_bandwidth === null || t.low_bandwidth === undefined)

  return (
    <EditorialLayout
      kicker="Editorial standards"
      title="How we rate tools"
      sub="What Local Fit measures, what Bohemo Verified checks, and where money changes hands."
      updated="Last updated [DATE]"
      toc={TOC}
    >
      <EditorialSection id="fit" n={1} title="Local Fit">
        <p className={PROSE}>
          Local Fit is a count of five checks for how well a tool works in one market. It is not a review of how good the tool is.
          A brilliant tool can score low if you can’t pay for it in rupees.
        </p>
        <p className={PROSE}>
          The score is per market. The same tool can score differently in India and in Indonesia, so we always say which market a
          score is for.
        </p>
        <h3 className={H3}>The five checks</h3>
        <dl className="m-0 -mt-1.5 border-t-hairline border-border-strong">
          {CHECKS.map(([name, what, how], i) => (
            <div
              key={name}
              className="grid gap-1.5 border-b-hairline border-border-hairline py-4 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6"
            >
              <dt className="flex gap-3 text-body font-bold leading-snug">
                <span className="w-3.5 shrink-0 font-mono text-[12.5px] font-medium leading-[22px] text-ink-700">{i + 1}</span>
                {name}
              </dt>
              <dd className="m-0 grid gap-1.5 pl-[26px] md:pl-0">
                <p className="text-pretty text-body leading-normal">{what}</p>
                <p className="text-body-sm text-ink-700">{how}</p>
              </dd>
            </div>
          ))}
        </dl>

        <h3 className={H3}>What the dots mean</h3>
        <div className="-mt-1.5 grid gap-2 md:grid-cols-2 md:gap-4">
          <div className="grid grid-cols-[14px_minmax(0,1fr)] gap-3 rounded-md border-hairline border-border-strong bg-surface-raised p-4 md:px-5 md:py-[18px]">
            <Dot on />
            <div className="text-[15px] leading-normal text-ink-700">
              <p className="mb-1 font-bold text-text-strong">Filled: confirmed</p>
              <p>We checked it ourselves and it holds. The tool page says how we know.</p>
            </div>
          </div>
          <div className="grid grid-cols-[14px_minmax(0,1fr)] gap-3 rounded-md border-hairline border-border-strong bg-surface-raised p-4 md:px-5 md:py-[18px]">
            <Dot />
            <div className="text-[15px] leading-normal text-ink-700">
              <p className="mb-1 font-bold text-text-strong">Empty: not checked yet</p>
              <p>
                We haven’t confirmed it. It doesn’t mean the tool fails; it means we don’t know yet, and we say so instead of guessing.
              </p>
            </div>
          </div>
        </div>
        <p className={PROSE}>There are no half dots. A check is confirmed or it isn’t, and the score is the number of filled dots.</p>

        {noDeviceTestYet && (
          <div className="grid items-start gap-4 border-b-hairline border-t-heavy border-b-border-hairline border-t-ink-900 py-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-7 md:py-6">
            <LocalFitMeter fit={EXAMPLE_FIT} size="lg" showLabel={false} />
            <div>
              <h3 className="font-display text-title-3 font-bold text-text-strong">Why no tool has all five confirmed yet</h3>
              <p className="mt-2 text-pretty text-body leading-[1.55] text-ink-700">
                The low-end Android check needs a person, a real phone and a slow connection. We haven’t run that test on any tool yet,
                so that dot is empty everywhere and the most any tool can have today is 4 confirmed. When we start testing, scores will
                move one tool at a time, and each tool page will show the date.
              </p>
            </div>
          </div>
        )}
      </EditorialSection>

      <EditorialSection id="dates" n={2} title="Last checked dates">
        <p className={PROSE}>
          Every tool page shows when we last checked it, and the pricing section carries its own date, because prices change more often
          than anything else.
        </p>
        <div
          aria-label="Example from a tool page"
          className="flex min-h-[52px] flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md border-hairline border-dashed border-border-strong px-3 py-2 md:px-4 md:py-1"
        >
          <span className="text-body-sm text-text-muted">Last checked [DATE]. See something wrong?</span>
          <span className="text-[15px] font-semibold underline underline-offset-[3px]">Report a mistake</span>
        </div>
        <p className={PROSE}>
          We check Local Fit for every tool on our own schedule: every 90 days, and again whenever a tool changes its price. Who checks:
          [WHO SCORES]. No company can pay to be checked sooner, and listing a tool doesn’t fill any dots.
        </p>
      </EditorialSection>

      <EditorialSection id="verified" n={3} title="Bohemo Verified">
        <p className={PROSE}>
          Bohemo Verified checks the company’s own claims about itself. It is a separate check from Local Fit and never changes a score.
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-label font-medium uppercase text-text-muted">Example</span>
          <VerifiedBadge example />
          <Tag variant="outline">Not yet Bohemo Verified</Tag>
        </div>
        <NumberedList
          items={VERIFIED_CHECKS.map(([t, d]) => (
            <>
              <b>{t}.</b> {d}
            </>
          ))}
        />
        <p className={PROSE}>
          Companies pay for this check, because it takes an editor’s time. That is why it sits next to the tool’s name and never inside
          the score: a company can pay to have its claims checked, not to be ranked higher. We re-verify every 12 months. If a
          company’s claims stop being true, the badge comes off.
        </p>
      </EditorialSection>

      <EditorialSection id="money" n={4} title="Sponsored listings and affiliate links">
        <p className={PROSE}>Some companies pay for a Sponsored slot. Some links earn us a fee. Both are always labelled where you see them.</p>
        <div className="grid border-t-hairline border-border-strong">
          {[
            {
              eg: <SponsoredLabel />,
              text: (
                <>
                  <b>Sponsored.</b> A paid slot. It sits in its own row, outside the ranked list, and doesn’t push any tool down the
                  ranking. Its Local Fit score is the same one every reader sees.
                </>
              ),
            },
            {
              eg: <p className="font-mono text-xs text-ink-700">Affiliate link · we may earn a fee if you sign up. It doesn’t change the score.</p>,
              text: (
                <>
                  <b>Affiliate link.</b> Shown under the button on the tool page. We pick which tools to list before we know whether a
                  link pays.
                </>
              ),
            },
            {
              eg: <p className="font-mono text-xs text-ink-700">Direct link · not an affiliate link</p>,
              text: (
                <>
                  <b>Direct link.</b> We earn nothing if you sign up.
                </>
              ),
            },
          ].map((row, i) => (
            <div key={i} className="grid items-start gap-2.5 border-b-hairline border-border-hairline py-[18px] md:grid-cols-[300px_minmax(0,1fr)] md:gap-6">
              <div>{row.eg}</div>
              <p className="text-pretty text-body leading-normal">{row.text}</p>
            </div>
          ))}
        </div>
        <p className={PROSE}>
          The Signal carries no sponsored stories. Pro members see no ads, but they see the same scores and the same rankings as everyone
          else.
        </p>
      </EditorialSection>

      <EditorialSection id="report" n={5} title="Report a mistake">
        <p className={PROSE}>Every tool page has “Report a mistake”. Anyone can use it, including the company that makes the tool.</p>
        <NumberedList items={REPORT_STEPS} />
        <p className={PROSE}>
          Reports can’t be paid for, and a report doesn’t change a score on its own. Only our own check does. For mistakes in a news
          story, see the{' '}
          <Link href="/about#corrections" className={PROSE_LINK}>
            corrections policy
          </Link>
          .
        </p>
      </EditorialSection>

      <EditorialSection id="never" n={6} title="What money can and can’t buy">
        <table className="w-full border-collapse border-t-heavy border-ink-900 text-[15px] md:text-body">
          <thead>
            <tr>
              <th scope="col" className="border-b-hairline border-border-hairline py-3.5 text-left font-display text-[17px] font-bold">
                Paying can
              </th>
              <th
                scope="col"
                className="w-[76px] border-b-hairline border-border-hairline py-3.5 pl-3 text-left md:w-[120px] md:pl-5"
              >
                <span className="font-mono text-label font-medium uppercase text-text-muted">Yes or no</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {MONEY.map(([t, yes]) => (
              <tr key={t}>
                <th
                  scope="row"
                  className={`border-b-hairline border-border-hairline py-3.5 text-left leading-snug ${yes ? 'font-medium' : 'font-bold'}`}
                >
                  {t}
                </th>
                <td className="border-b-hairline border-border-hairline py-3.5 pl-3 md:pl-5">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Icon name={yes ? 'check' : 'x'} size={18} strokeWidth={2} className="shrink-0" />
                    {yes ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </EditorialSection>

      <nav aria-label="Where next" className="grid justify-items-start border-t-heavy border-ink-900 pt-5">
        <Link href="/tools" className={MORE_LINK}>
          See the tools, ranked by Local Fit →
        </Link>
        <Link href="/about" className={MORE_LINK}>
          About Bohemo and our editorial standards →
        </Link>
        <Link href="/get-listed" className={MORE_LINK}>
          Get your tool listed →
        </Link>
      </nav>
    </EditorialLayout>
  )
}
