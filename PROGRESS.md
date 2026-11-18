# PROGRESS.md — Bohemo v2 redesign (see SPEC.md)

1. Design tokens in `tailwind.config.js`, fonts via `next/font`, global nav / tab bar / footer.
2. Migration for Local Fit, edition and submissions fields (written; run separately).
3. Home: pulse, hero search, The Signal, trending, standards, newsletter, founding.
4. `/tools` directory with filters, sort, save, compare tray, sponsored row and Stacks.
5. `/tools/[slug]` (Local Fit breakdown, Report a mistake → `/api/submit`, alternatives, news, what changed, Verified box) and `/compare` (desktop table, mobile swipe tabs, hide-what's-the-same); `/tools/compare` redirects to `/compare`.
6. `/news` The Signal (today's edition with region tabs, read progress, "You're caught up"; "lands at 8:00 IST" state with the latest edition or latest stories), `/news/archive` (last 7 days free, Pro gate after), `/news/archive/[date]` (one page per edition), `/news/[id]` (our summary, why it matters, tools in the story, link to the original, next story).

## Real-database checks (Taranga runs these on the Vercel preview at the end)

These write rows, so they are never run during the build.

- [ ] Report a mistake (tool page) → one `submissions` row, `type = report_mistake`, payload has `tool_slug`.
- [ ] The Signal with a real edition: once some `news` rows have `edition_date` and `edition_rank`, check `/news` (tabs, "3 of 7 read" after opening stories, "You're caught up"), an article's "Next story", and `/news/archive/<date>`. The live database has no editions yet, so only the "not out yet" state was checked against it; the edition logic was tested with mocked rows.

## Pre-launch fixes

- [ ] Missing tool pages (`/tools/<unknown-slug>`) must return a real 404 status. Today they render the not-found page with `noindex` but status 200, because the `/tools` loading boundary starts streaming before `notFound()` runs. Same check for `/news/<unknown-id>`.

## Data notes

- `news.tools_mentioned` holds **tool slugs** (`chatgpt`, matching `tools.slug`), never names. Checked 18 Nov 2026 with a read-only SELECT: all 5 news rows have it empty and no ingest code fills it yet, so whatever ingest gets built must write slugs.
- No `news` row has an `edition_date` yet, so The Signal shows its "not out yet" state with the latest stories until editions are filled in.
