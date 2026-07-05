# SPEC.md — bohemo. overnight build (7 tasks)

> **For the agent:** This is a single autonomous overnight run. Execute the seven tasks **in order**. Each task builds on the previous one. After a task passes `npm run build`, commit it, then move to the next. Read `CLAUDE.md` in the repo root first — every rule there still applies and this spec never overrides it. When this spec and CLAUDE.md agree, follow both. When in doubt, do less, not more.

---

## 0. Global rules (apply to every task)

**Build verification — the only definition of "done" for a task:**
```bash
npm run build && npm run start
```
`npm run dev` is broken. Never run it. Never commit code that fails `npm run build`. If the build fails, read the error, fix it, and build again before doing anything else.

**Commit discipline:**
- Commit **after each task** passes `npm run build`, and only then.
- One task = one commit (or a few small commits within that task, each of which builds).
- Use the exact commit message given at the end of each task.
- **Do not push to `main`.** Do not push at all. Just commit locally on the current branch.
- Do not squash unrelated changes together.

**Failure policy:**
- If a task cannot be made to pass `npm run build` after **10 genuine attempts**, stop that task, `git stash` or discard its incomplete changes so the repo still builds, leave a short note in a file called `OVERNIGHT_NOTES.md` at the repo root explaining what failed and why, and **move on to the next task.** Do not let one stuck task block the rest.
- A later task depending on a skipped one should still attempt its own independent parts.

**Scope discipline (from CLAUDE.md, repeated because it matters most on unattended runs):**
- Never delete existing files. Only create or edit.
- Never modify the Supabase schema (no `ALTER TABLE`, no new tables, no migrations).
- Never install npm packages unless this spec names them explicitly. (This spec names **none** — everything here uses what is already installed: Next.js, Supabase client, Tailwind, and the existing PostHog + ConvertKit setup.)
- Never modify `tailwind.config.js`, `.env`, `.env.local`, `.gitignore`, or `next.config.js` unless a task explicitly says to. **No task here says to.**
- Never refactor code you were not asked to touch.
- Never use `any` in TypeScript — use proper types or `unknown`.
- Never hard-code data that should come from Supabase.
- Never leave `console.log` in committed code.
- Reuse the **existing** Supabase client utility (the one the homepage already uses to pull live data). Do not create a second Supabase client.

**Brand tokens (mandatory, Tailwind utility classes only for new components):**
| Token | Value |
|-------|-------|
| Cream (background) | `#F0EDE6` |
| Ink (text, buttons) | `#0D0D0D` |
| Muted (secondary text) | `#6B6560` |
| Cream dark | `#E8E4DC` |
| Cream mid | `#EBE7DF` |
| Pill background | `#E3DFD7` |
| Border | `rgba(13,13,13,0.10)` |

Design rules: **no gradients, no box shadows, no bright accent colors — ever.** Cream and ink only. Pills are `rounded-full`; cards are `rounded-2xl` or `rounded-xl`. Headlines get `tracking-tight`. Font weights: 400 body, 500 subtle, 600 labels, 700 subheads, 800 headlines, 900 stats. Inter for body; Poppins Bold for the wordmark only. Aesthetic: Stripe's cleanliness meets Rest of World's editorial seriousness.

If a Tailwind arbitrary value is needed for a brand color, use the hex directly, e.g. `bg-[#F0EDE6]`, `text-[#0D0D0D]`, `text-[#6B6560]`, `border-[rgba(13,13,13,0.10)]`.

**Empty / loading / error states:** Every Supabase table may have **0 rows**. Every page and section must render a clean empty state, never a crash or a broken layout. Design the empty state first.

**Site URL:** Use `process.env.NEXT_PUBLIC_SITE_URL` and fall back to `https://bohemoai.com` when it is undefined. Do not hard-code the domain anywhere else — reference this single value.

**Supabase tables (all have RLS enabled — read access is what these tasks need):**

`tools`: `id` (uuid), `name` (text), `slug` (text, unique), `description` (text), `url` (text), `category` (text), `price_type` (enum: free / freemium / paid / open-source), `price_label` (text), `tags` (text[]), `region_relevance` (text[]), `verified` (boolean), `created_at` (timestamptz)

`news`: `id` (uuid), `title` (text), `excerpt` (text), `url` (text, unique), `source` (text), `category` (text), `region` (text), `published_at` (timestamptz), `created_at` (timestamptz)

`subscribers`: `id` (uuid), `email` (text, unique), `created_at` (timestamptz)

---

## Task 1 — Individual tool pages `/tools/[slug]`

**Goal:** A dynamic detail page for each tool, pulling live from the `tools` table.

**Files:**
- Create `/app/tools/[slug]/page.tsx` (async server component).
- Create `/app/tools/[slug]/not-found.tsx` (route-level 404 for a missing slug).

**Data fetching:**
- Fetch the tool: `from('tools').select('*').eq('slug', params.slug).single()`.
- If the query errors or returns no row, call `notFound()` from `next/navigation`. Do not render a broken page.
- "Similar tools": `from('tools').select('*').eq('category', tool.category).neq('slug', tool.slug).limit(3)`. If this returns 0 rows, hide the whole section (do not render an empty heading).

**Page content (in this order):**
1. A "← Back to directory" link at the top, pointing to `/tools`. Make it a real, tappable link.
2. Tool name as the page headline (`tracking-tight`, weight 800).
3. A row of metadata pills: category, `price_label` (fall back to a humanized `price_type` if `price_label` is empty), and a "Verified" pill **only when `verified === true`**.
4. Full `description` in readable body text (`#6B6560` or ink depending on hierarchy).
5. Tags: render `tags[]` as pills. Region relevance: render `region_relevance[]` as pills, visually distinct from tags (e.g. a small label "Relevant in:" before them). Handle null/empty arrays gracefully — render nothing, not an empty container.
6. A primary "Visit tool" button linking to the tool's `url` (`target="_blank"`, `rel="noopener noreferrer"`), styled as the ink pill button.
7. "Similar tools" section: 3 cards from the same category, each linking to that tool's own `/tools/[slug]` page. Reuse the visual style of the existing directory tool cards for consistency.

**not-found.tsx:** On-brand 404 — "This tool isn't in the directory (yet)." plus a link back to `/tools`. Cream background, ink text, no shadows.

**Definition of done:** `npm run build` passes. Visiting a real slug renders the full page; a nonsense slug renders the on-brand 404; empty similar-tools does not break layout.

**Commit message:**
```
feat: add individual tool detail pages at /tools/[slug]
```

---

## Task 2 — Individual news article pages `/news/[id]`

**Goal:** A dynamic detail page for each news item, pulling live from the `news` table.

**Files:**
- Create `/app/news/[id]/page.tsx` (async server component).
- Create `/app/news/[id]/not-found.tsx` (route-level 404).

**Data fetching:**
- Fetch the article: `from('news').select('*').eq('id', params.id).single()`.
- If it errors or returns no row, call `notFound()`.
- "More from this region": `from('news').select('*').eq('region', article.region).neq('id', article.id).limit(3)`. If 0 rows, hide the section.

**Page content (in this order):**
1. "← Back to news" link at the top → `/news`.
2. `source` and `region` shown as small pills / labels near the top.
3. Article `title` as the headline (`tracking-tight`, weight 800).
4. `published_at` formatted as a human date (e.g. "6 Jul 2026"). Format with `Intl.DateTimeFormat('en-GB', ...)` — no extra libraries. Handle a null `published_at` by falling back to `created_at`, and if both are null, omit the date.
5. Full `excerpt` in readable body text.
6. A "Read the original ↗" button linking to the article's `url` (`target="_blank"`, `rel="noopener noreferrer"`), ink pill style.
7. "More from this region" section: 3 related cards, each linking to its own `/news/[id]` page. Match the existing news-feed card style.

**not-found.tsx:** On-brand 404 — "This story isn't in the feed." plus a link back to `/news`.

**Definition of done:** `npm run build` passes. Real id renders fully; bad id renders 404; date formatting works; empty related section doesn't break layout.

**Commit message:**
```
feat: add individual news article pages at /news/[id]
```

---

## Task 3 — Full SEO infrastructure

**Goal:** Metadata, OpenGraph, JSON-LD, sitemap, and robots across the whole site. This task depends on Tasks 1 and 2 existing.

**A. Metadata exports** — add or extend the Next.js `metadata` / `generateMetadata` export on each of:
- Homepage (`/app/page.tsx`) — static `metadata`.
- Tools directory (`/app/tools/page.tsx`) — static `metadata`.
- Tool detail (`/app/tools/[slug]/page.tsx`) — `generateMetadata({ params })` using the tool's name + description. If the tool isn't found, return sensible fallback metadata (don't throw).
- News feed (`/app/news/page.tsx`) — static `metadata`.
- News detail (`/app/news/[id]/page.tsx`) — `generateMetadata({ params })` using the article's title + excerpt, with fallback if not found.

Each metadata object must include: `title`, `description`, and an `openGraph` block (`title`, `description`, `url`, `siteName: 'bohemo.'`, `type` — `website` for homepage/directory/feed, `article` for news detail, `website` for tool detail). Titles should follow the pattern `"<Page> — bohemo."`. Use `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bohemoai.com')` in the **root layout** metadata so relative OG URLs resolve. If the root layout has no metadata export, add a minimal one with `metadataBase` and default title/description — do not disturb anything else in that file.

**B. JSON-LD structured data** — inject a `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />` inside the relevant server component:
- Homepage → `WebSite` schema (name "bohemo.", url = site URL, description).
- Tool detail → `Product`/`SoftwareApplication` schema (name, description, category, url, and offers/price info derived from `price_type`/`price_label`).
- News detail → `Article` schema (headline = title, description = excerpt, datePublished = published_at, author/publisher = source, url).
Keep schemas minimal and valid — only fields you actually have data for. Do not invent ratings or authors you don't have.

**C. Sitemap** — create `/app/sitemap.ts` exporting `default async function sitemap(): Promise<MetadataRoute.Sitemap>`:
- Include static routes: `/`, `/tools`, `/news`.
- Fetch **all** tool slugs from Supabase and add `/tools/<slug>` for each.
- Fetch **all** news ids from Supabase and add `/news/<id>` for each.
- Use the site URL constant for absolute URLs. Set reasonable `lastModified` (use `created_at`/`published_at` where available). If Supabase returns nothing, still return the static routes — never throw.

**D. Robots** — create `/app/robots.ts` exporting `default function robots(): MetadataRoute.Robots` that allows all user agents (`userAgent: '*', allow: '/'`) and points `sitemap` to `<siteURL>/sitemap.xml`.

**Definition of done:** `npm run build` passes. `/sitemap.xml` and `/robots.txt` resolve in `npm run start`. Every listed page has a `<title>`, OG tags, and (where specified) a JSON-LD script in the rendered HTML.

**Commit message:**
```
feat: add SEO metadata, OpenGraph, JSON-LD, sitemap, and robots
```

---

## Task 4 — Newsletter signup wired to ConvertKit (Kit)

**Goal:** A working, reusable newsletter form that subscribes via ConvertKit **and** stores a backup row in Supabase.

**Environment variables (reference only — do not create or edit `.env`):**
- `CONVERTKIT_API_KEY`
- `CONVERTKIT_FORM_ID`
These are server-side secrets. Read them **only** inside the API route, never in a client component.

**A. API route** — create `/app/api/subscribe/route.ts` with a `POST` handler:
1. Parse `{ email }` from the JSON body. Validate the email server-side with a standard regex; return HTTP 400 `{ error: 'invalid_email' }` on failure.
2. Subscribe to ConvertKit:
   `POST https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`
   with JSON body `{ api_key: process.env.CONVERTKIT_API_KEY, email }` and `Content-Type: application/json`.
   Wrap in try/catch. If ConvertKit is unreachable, still attempt the Supabase backup, then return an error the client can show.
3. Insert into Supabase `subscribers` (`{ email }`). The `email` column is unique — if the insert fails on a duplicate (Postgres error code `23505`), treat it as **already subscribed**, not an error: return HTTP 200 `{ status: 'duplicate' }`.
4. On full success return HTTP 200 `{ status: 'success' }`. On unexpected server error return HTTP 500 `{ error: 'server_error' }`.
5. Never log the email or the API key.

**B. Reusable component** — create `/components/NewsletterForm.tsx` (client component, `'use client'`):
- Controlled email input + submit button, styled to match the existing homepage newsletter card (cream input, ink button, `rounded-full`).
- Client-side email validation before submit.
- States: `idle`, `loading` (button shows a subtle "Subscribing…" and is disabled), `success` (replace the form with **"You're in!"** and a one-line confirmation), `duplicate` (show "You're already on the list."), `error` (show "Something went wrong — try again." and let them retry).
- `POST`s to `/api/subscribe`. Reads the `status`/`error` field from the response to pick the state.
- Accept optional props so it can be reused in different placements (e.g. a `variant` or `className` prop) without duplicating logic.

**C. Wire it up:** Replace the existing static homepage newsletter form markup with `<NewsletterForm />`. Match the current layout so the page looks unchanged until someone submits. Do not remove the surrounding newsletter section copy.

**Definition of done:** `npm run build` passes. Submitting a valid new email shows "You're in!"; a duplicate shows the already-subscribed state; an invalid email is blocked client-side; server errors surface the retry state. Secrets are only read server-side.

**Commit message:**
```
feat: wire newsletter to ConvertKit with Supabase backup (reusable form)
```

---

## Task 5 — Full mobile responsive pass

**Goal:** Every page works cleanly on a 375px-wide screen (iPhone SE baseline) with no horizontal scroll and comfortable touch targets. This task depends on all pages from Tasks 1–4 existing.

**Pages to audit and fix:** homepage (`/`), `/tools`, `/tools/[slug]`, `/news`, `/news/[id]`, and `/tools/compare` **if Task 7 has already run** (otherwise skip compare here and it will be responsive by construction in Task 7).

**Requirements:**
- **No horizontal overflow at any width.** Check for fixed pixel widths, oversized min-widths, wide grids that don't collapse, long unbroken strings, and overflowing pill rows. Pill/tag rows should wrap (`flex-wrap`). Add `overflow-x-hidden` guards only where a real overflow exists — don't blanket-apply it.
- **Touch targets ≥ 44×44px** for every tappable element (nav links, buttons, tool/news cards, filter controls, back links, pagination). Use `min-h-[44px]` and adequate padding.
- **No text below 14px on mobile.** Smallest allowed is `text-sm` (14px). Bump anything smaller.
- **Grids collapse** to a single column (or a sensible 2-col) below 640px. Multi-column card grids → 1 column on mobile.
- **Nav** must be usable on mobile (the current desktop nav hides its links below 900px — make sure the logo + primary CTA remain reachable and tappable; if there's no mobile menu, at minimum keep the CTA visible and tappable).
- Test mentally at **375px** first, then confirm nothing breaks between 375px and 640px.

**Constraint:** Fix layout only. Do not redesign, do not change brand tokens, do not alter desktop layout except where a shared class must change (in which case verify desktop still looks right). Prefer Tailwind responsive prefixes (`sm:`, `md:`) over new breakpoints.

**Definition of done:** `npm run build` passes. Every page is single-column-clean and scroll-free at 375px; all tap targets meet 44px; no sub-14px text remains.

**Commit message:**
```
fix: full mobile responsive pass across all pages (375px baseline)
```

---

## Task 6 — PostHog analytics event tracking

**Goal:** Capture the key interaction events using the **existing** PostHog setup in the codebase. Do not re-initialize PostHog or add a new provider — find how it's already wired and reuse it (client-side `posthog.capture(...)`).

**Events to add (event name → properties):**
| Trigger | Event name | Properties |
|---|---|---|
| Tool card clicked (directory or similar-tools) | `tool_card_click` | `{ tool_name, category }` |
| News article card clicked | `news_article_click` | `{ article_title, region }` |
| Category or price filter changed on `/tools` | `tools_filter_change` | `{ filter_type: 'category' \| 'price', value }` |
| Region filter changed on `/news` | `news_filter_change` | `{ region }` |
| Newsletter signup attempt resolves | `newsletter_signup` | `{ status: 'success' \| 'duplicate' \| 'error' }` |
| Waitlist button clicked | `waitlist_click` | `{ location: 'nav' \| 'hero' }` (or wherever it lives) |

**Implementation notes:**
- Capture calls run in **client components** only. Where a card is currently a server component, add a thin client wrapper (or a click handler on an existing client boundary) rather than converting whole pages to client rendering.
- Fire `newsletter_signup` from inside `NewsletterForm` (Task 4) at the point the response resolves, tagging the resolved `status`.
- Guard every capture so a missing/undisabled PostHog instance never throws (`if (typeof window !== 'undefined' && posthog) { ... }` or the equivalent for the existing setup).
- Keep property names exactly as written above so dashboards stay consistent.

**Definition of done:** `npm run build` passes. Each listed interaction fires its event with the specified properties; no capture call can crash a page if PostHog is unavailable.

**Commit message:**
```
feat: add PostHog event tracking for key interactions
```

---

## Task 7 — Tools comparison feature `/tools/compare`

**Goal:** Let users pick 2–3 tools on the directory and see them side by side.

**A. Selection on `/tools`:**
- Add a checkbox to each tool card (or a small "Compare" toggle) that adds/removes that tool from a selection, capped at **3**. When the cap is reached, disable unchecked boxes.
- Track selection as an **array of slugs** in client state. When **2 or 3** are selected, show a floating/sticky "Compare (n)" button.
- The Compare button navigates to `/tools/compare?tools=slug1,slug2,slug3` (comma-separated slugs in the query string). Using the URL keeps it shareable and stateless — do **not** use `localStorage`/`sessionStorage`.
- Add selection interactivity via a client component/boundary; do not convert the whole directory to client-side data fetching. The tool data still comes from Supabase.

**B. Compare page** — create `/app/tools/compare/page.tsx`:
- Read `searchParams.tools`, split on commas, take at most 3 slugs.
- Fetch those tools: `from('tools').select('*').in('slug', slugs)`.
- Render a **side-by-side comparison** — a responsive table or column layout comparing, row by row: name, description, category, price (`price_label`/`price_type`), tags, region relevance, and verified status. Each column header is the tool name linking to its `/tools/[slug]` page.
- On mobile, the side-by-side must not overflow — either allow a horizontal scroll **within the comparison container only** (not the whole page) or stack into labelled cards below 640px. Pick the cleaner option and keep tap targets ≥44px.
- **Empty state:** if fewer than 2 valid tools resolve (no param, one slug, or bad slugs), show a clean message — "Pick 2 or 3 tools from the directory to compare." — plus a "← Back to directory" link. Never crash.
- Include a "← Back to directory" link regardless.

**C. Analytics (if Task 6 ran):** fire a `tools_compare_view` event (`{ count, slugs }`) when the compare page loads with ≥2 tools. If Task 6 was skipped, omit this.

**Definition of done:** `npm run build` passes. Selecting 2–3 tools and clicking Compare shows a correct side-by-side view; the page is scroll-safe on mobile; empty/invalid selections show the clean empty state.

**Commit message:**
```
feat: add tools comparison at /tools/compare with directory selection
```

---

## Final step (after all tasks)

- Run `npm run build` one last time to confirm the whole repo compiles.
- If `OVERNIGHT_NOTES.md` exists (from any skipped task), make sure it clearly lists what was skipped and why.
- Leave everything committed on the current branch. **Do not push. Do not touch `main`.**
