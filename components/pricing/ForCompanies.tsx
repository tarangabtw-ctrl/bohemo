import { REVIEW_TIME } from '@/lib/pricing'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { LocalFitMeter } from '../LocalFitMeter'
import { SponsoredLabel } from '../SponsoredLabel'
import { VerifiedBadge } from '../VerifiedBadge'

const CARD = 'flex flex-col gap-[18px] rounded-lg border-hairline bg-surface-raised p-5 md:p-7'
const NAME = 'font-display text-xl font-bold tracking-title text-text-strong'
const NOTE = 'text-[13.5px] text-text-muted'
const WHO = 'text-pretty text-[15px] leading-snug text-ink-700'
const LIST = 'mt-auto flex flex-col gap-2.5 border-t-hairline border-border-hairline pt-4 text-[14.5px]'
const PH = 'font-mono text-xl font-medium leading-10 tracking-tight text-text-strong'
const SECTION_LABEL = 'font-mono text-label font-medium uppercase text-text-muted'
const MORE = 'inline-flex min-h-hit-min items-center text-[15px] font-semibold text-text-link no-underline hover:underline'

const VERIFY_CHECKS = [
  'The company is real',
  'Its listed prices are accurate',
  'The product works as described',
  'There is a real support contact',
  'Its data handling has been reviewed',
]

// A sponsored card as it appears in /tools. Every value is a stand-in, never a real tool.
const EXAMPLE_FIT = { criteria: [], dots: [false, false, false, false, false], confirmed: 0, notCheckedYet: 5 }

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon name="check" size={18} strokeWidth={2} className="mt-px shrink-0" />
      <span>{children}</span>
    </li>
  )
}

function Actions() {
  return (
    <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
      <Button size="lg" href="/get-listed">
        Submit your tool
      </Button>
      <Button size="lg" variant="secondary" href="/get-listed#talk">
        Talk to us
      </Button>
    </div>
  )
}

export function ForCompanies() {
  const agencyUrl = process.env.NEXT_PUBLIC_AGENCY_URL

  return (
    <div className="pb-12 md:pb-[72px]">
      <div className="mt-6 grid justify-items-start gap-3 md:mt-7 md:gap-4">
        <h1 className="max-w-[900px] font-display text-display-xl font-extrabold text-text-strong">Listing is free. The score is never for sale.</h1>
        <p className="max-w-[620px] text-pretty text-[17px] leading-normal text-ink-700 md:text-[19px]">
          You can pay for a labelled slot or to have your claims verified. Neither changes your Local Fit score.
        </p>
        <Actions />
      </div>

      <div className="grid gap-3 pt-7 md:grid-cols-3 md:gap-5 md:pt-10">
        <div className={`${CARD} border-ink-900`}>
          <span className={NAME}>Free listing</span>
          <div className="grid gap-1.5">
            <span className="font-mono text-[40px] font-medium leading-none tracking-tight">₹0</span>
            <p className={NOTE}>Reviewed in {REVIEW_TIME}.</p>
          </div>
          <p className={WHO}>Any AI tool that works in our markets can be listed.</p>
          <Button block href="/get-listed">
            Submit your tool
          </Button>
          <ul className={LIST}>
            <Item>A tool page written by Bohemo editors</Item>
            <Item>Local Fit scored on the same 5 checks as every tool</Item>
            <Item>Shown in the directory, search and compare</Item>
          </ul>
        </div>

        <div className={`${CARD} border-border-hairline`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={NAME}>Featured placement</span>
            <SponsoredLabel compact />
          </div>
          <div className="grid gap-1.5">
            <span className="flex items-baseline gap-1.5">
              <span className={PH}>[FEATURED PRICE]</span>
              <span className="text-sm text-text-muted">/[PERIOD]</span>
            </span>
            <p className={NOTE}>Always labelled &ldquo;Sponsored&rdquo;.</p>
          </div>
          <p className={WHO}>A paid slot in the directory, for the markets you choose.</p>
          <Button variant="secondary" block href="/get-listed#talk">
            Talk to us
          </Button>
          <ul className={LIST}>
            <Item>A slot in the tools directory for [MARKETS / CATEGORIES]</Item>
            <Item>The &ldquo;Sponsored&rdquo; label and note wherever it appears</Item>
            <Item>Your score and your place in the ranked results stay the same</Item>
            <Item>[SLOTS PER PAGE]</Item>
          </ul>
        </div>

        <div className={`${CARD} border-border-hairline`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={NAME}>Bohemo Verified</span>
            <VerifiedBadge example />
          </div>
          <div className="grid gap-1.5">
            <span className={PH}>[VERIFIED PRICE]</span>
            <p className={NOTE}>Manual review of what you say about yourself. Takes {REVIEW_TIME}.</p>
          </div>
          <p className="text-pretty text-[14.5px] font-semibold leading-snug">The fee pays for the review. It doesn&apos;t change the score.</p>
          <Button variant="secondary" block href="/get-listed#talk">
            Talk to us
          </Button>
          <ul className={LIST}>
            <li className="font-mono text-xs uppercase tracking-label text-ink-700">We verify your own claims</li>
            {VERIFY_CHECKS.map((c) => (
              <Item key={c}>{c}</Item>
            ))}
            <li className="mt-1.5 border-t-hairline border-border-hairline pt-3.5 text-[13.5px] leading-snug text-ink-700">
              Local Fit is separate. We check it for every tool on our own schedule, paid or not. Paying can&apos;t fill a dot or speed a check up.
            </li>
            <li>
              <a className={MORE} href="/how-we-rate">
                How we rate →
              </a>
            </li>
          </ul>
        </div>
      </div>

      <section
        aria-labelledby="sponsored-preview"
        className="mt-10 grid items-center gap-6 border-b-hairline border-t-heavy border-b-border-hairline border-t-ink-900 py-6 md:mt-14 md:grid-cols-[minmax(0,1fr)_320px] md:gap-20 md:py-8"
      >
        <div>
          <p className={SECTION_LABEL}>Featured placement</p>
          <h2 id="sponsored-preview" className="mt-1.5 font-display text-title-1 font-bold text-text-strong">
            What a sponsored listing looks like
          </h2>
          <ol className="mt-5 grid max-w-[620px] list-none p-0">
            {[
              'A “Sponsored” label sits at the top of the card, in every market and on every screen size.',
              'The line under the card says it plainly: “They paid to be here. It doesn’t change their score.”',
              'The description is written by Bohemo editors, and Local Fit is shown the same way as on every other tool.',
            ].map((s, i) => (
              <li key={s} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-t-hairline border-border-hairline py-3.5 text-body leading-snug">
                <span className="font-mono text-[12.5px] leading-6 text-ink-700">{String(i + 1).padStart(2, '0')}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-2.5">
          <span className={SECTION_LABEL}>As it appears in /tools</span>
          <article aria-label="Example of a sponsored listing" className="flex flex-col gap-3.5 rounded-lg border-hairline border-dashed border-border-strong bg-surface-raised p-5">
            <SponsoredLabel compact />
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-inset font-display text-lg font-extrabold text-ink-700" aria-hidden="true">
                E
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg font-bold leading-tight tracking-title text-text-strong">Example tool</div>
                <div className="mt-0.5 font-mono text-xs text-text-muted">[CATEGORY]</div>
              </div>
            </div>
            <p className="text-[14.5px] leading-snug text-ink-700">Written by Bohemo editors, the same as every tool page.</p>
            <LocalFitMeter fit={EXAMPLE_FIT} />
            <div className="flex items-center justify-between gap-2 border-t-hairline border-border-hairline pt-3.5">
              <span className="font-mono text-[13.5px] font-medium text-text-strong">[PRICE]</span>
              <span className="text-[14px] font-semibold text-text-link">See the rating →</span>
            </div>
          </article>
          <p className="text-[12.5px] text-text-muted">Sponsored. They paid to be here. It doesn&apos;t change their score.</p>
        </div>
      </section>

      <section
        aria-labelledby="agency-heading"
        className="mt-10 grid items-center gap-x-12 gap-y-5 rounded-lg border-thin border-dashed border-border-strong px-5 py-6 md:mt-14 md:grid-cols-[minmax(0,1fr)_auto] md:px-9 md:py-8"
      >
        <div>
          <p className={SECTION_LABEL}>Agency services · a separate company</p>
          <h2 id="agency-heading" className="mt-1.5 font-display text-title-1 font-bold text-text-strong">
            Need users, not just a listing?
          </h2>
          <p className="mt-2.5 max-w-[680px] text-pretty text-body leading-normal text-ink-700 md:text-[17px]">
            Bohemo Agency runs launch and growth campaigns for AI startups across India and Southeast Asia. It&apos;s a separate company, so working with it never affects your rating.
          </p>
        </div>
        {agencyUrl ? (
          <Button variant="secondary" href={agencyUrl} external className="w-full md:w-auto">
            Visit Bohemo Agency ↗
          </Button>
        ) : (
          <Button variant="secondary" href="/get-listed?topic=agency#talk" className="w-full md:w-auto">
            Talk to Bohemo Agency
          </Button>
        )}
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t-heavy border-ink-900 pt-6 md:mt-14">
        <h2 className="font-display text-title-1 font-bold text-text-strong">Start with the free listing.</h2>
        <Actions />
      </div>
    </div>
  )
}
