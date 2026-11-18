# PROGRESS.md — Bohemo v2 redesign (see SPEC.md)

1. Design tokens in `tailwind.config.js`, fonts via `next/font`, global nav / tab bar / footer.
2. Migration for Local Fit, edition and submissions fields (written; run separately).
3. Home: pulse, hero search, The Signal, trending, standards, newsletter, founding.
4. `/tools` directory with filters, sort, save, compare tray, sponsored row and Stacks.
5. `/tools/[slug]` (Local Fit breakdown, Report a mistake → `/api/submit`, alternatives, news, what changed, Verified box) and `/compare` (desktop table, mobile swipe tabs, hide-what's-the-same); `/tools/compare` redirects to `/compare`.
6. `/news` The Signal (today's edition with region tabs, read progress, "You're caught up"; "lands at 8:00 IST" state with the latest edition or latest stories), `/news/archive` (last 7 days free, Pro gate after), `/news/archive/[date]` (one page per edition), `/news/[id]` (our summary, why it matters, tools in the story, link to the original, next story).
7. `/pricing` (readers & builders / AI companies tabs, monthly–annual toggle, Get Pro → founding-member waitlist form, Expense it GST form, Free vs Pro table, FAQ placeholders (the founder's note was removed 18 Nov 2026: Bohemo has no founder persona); founding counter hidden) and `/get-listed` (tool submission form, Talk to us form, `?topic=agency` preselects Agency). Both forms validate in the browser and in `/api/submit` with the same rules (`lib/validateSubmission.ts`); the API stores only the known, cleaned fields.

8. `/how-we-rate`, `/about` (story example from the latest real story), `/saved` (tools and stories tabs, 20-save meter, sign-in nudge after 3 saves, full state with Get Pro), `/sign-in` (UI only: says plainly that sign-in isn't on yet; no email is sent), onboarding on first Home visit (mobile sheet with focus trap, desktop card, toast), command search (⌘K, "/", nav bar, mobile icon; data from read-only `/api/search`; arrow keys, Enter, Escape, recent searches on this device), 404, error, offline banner, `/tools` loading. Every Get Pro links to `/pricing?waitlist=1`, which opens the waitlist form. `/tools` applies `?q=` and `?task=`. Report a mistake now uses the shared rules: a link typed without https:// gets it added, then the strict check (links with `user:pass@` are refused).

9. PostHog: v1 event names unchanged; the 15 v2 events added and documented in `lib/analytics.ts` (who sends each, with which properties). `stack_cloned` is reserved: stacks can't be cloned yet, so nothing sends it. `checkout_started` is reserved for real checkout; the Pro waitlist sends `waitlist_opened` instead. Saves fire only when saving, and `edition_completed` once per edition per device.

10. Newsletter: `/api/subscribe` now checks the Kit config first (key set, form ID numeric) and adds to Kit before writing to Supabase. If Kit fails, nothing is written, so a retry isn't wrongly told "already subscribed". A Supabase failure after Kit succeeds still counts as subscribed. Config problems show in the Vercel function logs (values never logged). Form copy is in Bohemo's voice. **Not yet working end to end: the env values are wrong** (see "Newsletter: fix before testing" below).

## Real-database checks (Taranga runs these on the Vercel preview at the end)

These write rows, so they are never run during the build.

- [ ] Report a mistake (tool page) → one `submissions` row, `type = report_mistake`, payload has `tool_slug`.
- [ ] The Signal with a real edition: once some `news` rows have `edition_date` and `edition_rank`, check `/news` (tabs, "3 of 7 read" after opening stories, "You're caught up"), an article's "Next story", and `/news/archive/<date>`. The live database has no editions yet, so only the "not out yet" state was checked against it; the edition logic was tested with mocked rows.
- [ ] Pro waitlist (`/pricing` → Get Pro, annual) → one `submissions` row, `type = pro_waitlist`, `email` set, payload has `plan = annual` and `market`; add a GSTIN to check it's stored in capitals. Then once with monthly.
- [ ] Expense it (`/pricing` → Add GST details) → one row, `type = invoice_request`, `email` = "Send invoices to", payload has `company_name`, `billing_address`, `state`, `plan`, and `finance_email` if filled.
- [ ] Submit your tool (`/get-listed`) → one row, `type = tool_submission`, payload has the tool fields, `markets` as market ids (`in`, `id`…), `speaks_for_company = true`; the page switches to "Got it. Your tool is in the queue."
- [ ] Talk to us (`/get-listed#talk`, topic "Featured placement") → one row, `type = contact`, payload has `name`, `topic`, `message`.
- [ ] Talk to Bohemo Agency (footer link → `/get-listed?topic=agency`) → Agency is preselected, and sending gives one row with `type = agency`.
- [ ] Honeypot: none of the checks above should create a second row, and a real browser's autofill must not fill the hidden `fax_only` field (submissions with it filled are silently dropped).

- [ ] **Newsletter: fix the Kit env vars first, then test.** Checked 18 Nov 2026 with read-only Kit calls: `CONVERTKIT_FORM_ID` holds the Kit **API secret** (it authenticates as one), not the form's number, and `CONVERTKIT_API_KEY` is rejected by Kit (401). Set `CONVERTKIT_API_KEY` to the v3 API key (Kit → Settings → Developer) and `CONVERTKIT_FORM_ID` to the form's number (from its URL in Kit), in `.env.local` and in Vercel for Preview and Production. Consider regenerating the API secret, since it has been sent in the subscribe URL path to Kit. Then on the preview: subscribe with a real address → it appears in Kit under that form, one `subscribers` row, the form says "You're in…"; the same address again → "You're already on the list…".

## Security: server-only writes (18 Nov 2026)

- `/api/submit` and `/api/subscribe` write with `lib/supabaseAdmin.ts` (service role key, `server-only`, never `NEXT_PUBLIC_`, never logged). Checked after build: the key appears in no file under `.next/`. Reads stay on the public key.
- [x] Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel (Preview done 18 Nov 2026; Production once v2 is merged). Without it, forms on the preview return "That broke" and the newsletter skips our Supabase copy.
- [x] Applied 18 Nov 2026: `supabase/migrations/20261118075630_server_only_writes.sql` dropped `submissions_insert` and revoked EXECUTE on `rls_auto_enable()` from PUBLIC, anon and authenticated. Checked after: `submissions` has no policies (the advisor's "RLS enabled, no policy" note is intended), the function is executable only by postgres and service_role, and the `ensure_rls` trigger is still enabled.
- [ ] On the preview: send one Report a mistake and one Pro waitlist form, and check each lands as one `submissions` row (proves the service role write works now that the public key can't insert).
- [ ] Optional: the advisor still lists all four tables in the public GraphQL schema. That comes from the table-level SELECT grant, not from policies (RLS still returns no rows). To hide `submissions` and `subscribers`: `REVOKE SELECT ON public.submissions, public.subscribers FROM anon, authenticated;`
- [ ] **When redesign/v2 is merged into main:** drop `subscribers_insert` too (`DROP POLICY IF EXISTS "subscribers_insert" ON public.subscribers;`). It stays until then because main's coming-soon page posts to main's own `/api/subscribe`, which inserts with the public key.

## Pre-launch fixes

- [ ] Missing tool pages (`/tools/<unknown-slug>`) must return a real 404 status. Today they render the not-found page with `noindex` but status 200, because the `/tools` loading boundary starts streaming before `notFound()` runs. Same check for `/news/<unknown-id>`.
- [ ] Switch edition numbers from calculated to stored (comes with Task 11's stored edition number and date).
- [ ] Pricing placeholders to fill before launch: FAQ answers, [FEATURED PRICE]/[PERIOD], [VERIFIED PRICE], [MARKETS / CATEGORIES], [SLOTS PER PAGE], [+ SEA METHODS IF SUPPORTED], and [REPLY TIME] on Talk to us.

## Upcoming tasks (not built yet)

- Task 11: news import pipeline: RSS → Haiku scoring → fill `tools_mentioned` with slugs → `/admin/news` approval queue → publish an edition with a stored edition number and date.

## Data notes

- `news.tools_mentioned` holds **tool slugs** (`chatgpt`, matching `tools.slug`), never names. Checked 18 Nov 2026 with a read-only SELECT: all 5 news rows have it empty and no ingest code fills it yet, so whatever ingest gets built must write slugs.
- No `news` row has an `edition_date` yet, so The Signal shows its "not out yet" state with the latest stories until editions are filled in.
