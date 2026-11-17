# SPEC.md — Bohemo v2 redesign build

Read `CLAUDE.md` first, then the attached Claude Design handoff bundle for the Bohemo redesign.

## Goal

Implement the redesign in our existing Next.js 14 App Router + Tailwind + Supabase codebase, task by task, on the branch `redesign/v2`. The pages are unstyled stubs with data already wired: style them with the design system, don't rebuild the data layer. Never push to `main`.

## Rules

- Verify only with `npm run build && npm run start`. `npm run dev` is broken; don't use it.
- One commit per task, with a descriptive message. Every commit must build.
- No new npm packages. None are approved for this build.
- No Supabase schema changes except the migration file in Task 2, which you write but do not run.
- All data goes through `lib/queries.ts`, never hard-coded. All metadata goes through `lib/seo.ts`. Keep the existing JSON-LD. Every list handles empty, loading and error states.
- Colours, type, spacing and radii only from the design tokens. Never hand-type a hex value or a pixel size.
- Works from 390px up (check 360px too), WCAG AA contrast, 44px tap targets, no `console.log` left in the code.
- The brand name is always "Bohemo".
- Update `app/sitemap.ts` for every new route.

## Decisions from the design review (don't undo these)

- **Verified badge.** Never show the `verified` column in Supabase as a Bohemo Verified badge. It's old data. A tool shows the badge only when `verified_at` (Task 2) is set after a real review. While no tool has the badge, hide the "Bohemo Verified only" filter and the Verified row on Compare.
- **Local Fit.** 5 dots plus the text "[N] confirmed · [M] not checked yet", and the same words in the aria-label. Never "3/5". No half dots. Nothing paid can change it.
- **Fallback markets.** On screens that show scores: "Scored and priced for India until we cover [market]." On Pricing and Stacks (prices only): "Priced for India (₹) until we price [market]".
- **Sponsored listings** sit in their own row outside the ranked list, labelled "Sponsored · not part of the ranking", with the standard Local Fit meter. Never inside the ranking.
- **Starting market** comes from the device timezone (outside our markets: India). On mobile, the first line of the hero is a tappable "Showing [market] · Change". A market the reader picks themselves is remembered (localStorage) and always wins over the timezone guess.
- **Search placeholders:** the market's own language first, then English (India: English, Hindi, Bengali). Philippines, Malaysia and Singapore: English only.
- **The daily edition** is called "The Signal" everywhere, on the site and by email. No "Bohemo Weekly". It lands at 8:00 IST, shown in the reader's timezone. 7 stories, one read time.
- **Keyboard and focus** (skipped in design, build it here): the market picker, sort and filter options are real buttons with arrow keys, Enter and Escape. Dialogs and sheets trap focus and return it on close. Hidden panels are inert. The focus ring is cream on dark surfaces.
- **Fonts** via `next/font`, self-hosted, with unicode-range subsets. Devanagari, Bengali and Thai fonts load only when that text is on screen. Apply the `:lang()` type rules from the typography tokens.
- **The prototype faked these; build them for real:** save, compare picks and market persist across pages (localStorage); a checkout step; sent states for every form; search filters applied from `?task=` and `?q=`; a page for each past edition.
- **Forms** (Submit your tool, Talk to us, Report a mistake, Expense it, the Pro waitlist) post to a new `app/api/submit/route.ts`, built the same way as `app/api/subscribe/route.ts`. It validates the input, ignores submissions that fill a hidden honeypot field, and writes one row to the `submissions` table (Task 2). Each form sends its own `type`. Every form shows a sent state and an error state.
- **Payments aren't live yet.** Razorpay Subscriptions (UPI AutoPay, cards, GST invoices) comes in a later spec once the account is activated. Until then, every "Get Pro" button opens a short founding-member waitlist form (email, plan monthly/annual, optional company name and GSTIN) that posts to `/api/submit` with type `pro_waitlist`, then confirms: "You're on the list. We'll email you when Pro opens, at the founding price." The Expense it form posts with type `invoice_request`.
- **Founding counter.** Hide the [CLAIMED]/500 counter until real paid members exist. Until then show only "The first 500 Pro members keep this price for life."
- **Agency button.** If `NEXT_PUBLIC_AGENCY_URL` is set, the button reads "Visit Bohemo Agency ↗" and opens it in a new tab. If not, it reads "Talk to Bohemo Agency" and goes to the contact form on `/get-listed` with the topic set to Agency (type `agency`).
- **Verified review time** is "10 working days". Replace every [REVIEW TIME] with that.
- **Per-language type.** The `:lang()` rules for hi, bn, th and vi must apply to every heading and display style, including more specific ones such as the lead story headline in a news card. Check each.
- **Sticky nav** uses the nav's own scrolled state (60px, heavy ink rule); the transition is off under `prefers-reduced-motion`.
- **Font budget.** Measure total font transfer on a throttled 4G profile on Home and an article. Keep weights to the minimum the tokens use.
- **Pulse ticker** items come from the `news` table, never hard-coded. Hide the ticker when there's nothing to show.
- **Example Verified badges** on How we rate and Pricing are labelled "Example tool", never a real tool's name.

## Tasks, in order

1. Design tokens → `tailwind.config.js` theme (colours, type scale, radii, spacing), fonts via `next/font`. Global layout: nav (with the 60px scrolled state), mobile top bar and tab bar (Home · Tools · News · Saved), footer.
2. Write (don't run) a migration that adds Local Fit fields to `tools` (`languages text[]`, `payment_methods text[]`, `local_pricing jsonb`, `low_bandwidth boolean`, `data_in_region boolean`, `made_in_asia boolean`, `last_checked date`, `verified_at timestamptz`) and edition fields to `news` (`why_it_matters text`, `edition_date date`, `edition_rank smallint`, `tools_mentioned text[]`), and a new `submissions` table (`id uuid` primary key default `gen_random_uuid()`, `type text` not null, limited to `tool_submission`, `contact`, `agency`, `report_mistake`, `invoice_request`, `pro_waitlist`; `email text`; `payload jsonb` not null; `created_at timestamptz` default `now()`). Enable RLS on it with an insert-only policy for the anon role and no select policy. **Stop after this task.**
3. Home.
4. `/tools` directory with the Stacks tab: filters, sort, save, compare tray, the sponsored row.
5. `/tools/[slug]` tool page (with "Report a mistake") and `/compare`.
6. `/news` (The Signal, "You're caught up"), the archive with the free 7-day cut-off, and `/news/[id]` article pages (our summary + a link to the original).
7. `/pricing` (both audiences, Expense it form; Get Pro → the founding-member waitlist form until payments go live) and `/get-listed`.
8. `/how-we-rate`, `/about`, onboarding (mobile sheet, desktop card, toast), command search, `/saved`, the sign-in screen (UI only; auth gets wired later), 404, and loading/empty/error/offline states.
9. PostHog: keep every v1 event name in `lib/analytics.ts` unchanged. Add these alongside: `market_selected`, `task_search`, `task_result_click`, `tool_saved`, `story_saved`, `signup_from_saves`, `compare_opened`, `stack_cloned`, `edition_story_read`, `edition_completed`, `newsletter_subscribed` (with source), `news_to_tool_click`, `tool_to_news_click`, `checkout_started`, `outbound_tool_click`.
10. Fix the newsletter form so submissions reach `/api/subscribe` and arrive in Kit (form ID from env). Test it end to end on a preview deployment.

After each task, commit and add one line to `PROGRESS.md`.
