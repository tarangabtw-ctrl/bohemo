# CLAUDE.md — bohemo. project constitution (v2)

## What this project is

bohemo. (lowercase, with period — intentional, not a typo) is an AI ecosystem and marketplace for India and Southeast Asia: "the Bloomberg of AI for the Global South." Live surfaces: homepage, AI tools directory (with tool detail and compare), and AI news feed (with article pages). The agency arm and agents marketplace are not in this codebase yet.

The founder is non-technical. You are the engineering team. Write clean, conventional code. Do not get clever. Do not touch things you were not asked to touch.

---

## Current state: v2 redesign in progress

- The entire v1 UI was scrapped on branch `redesign/v2`. v1 is preserved at git tag `v1-final`.
- The old brand (cream/ink palette, Inter, "no shadows" rules) is **retired**. Do not reintroduce it.
- Every page is currently an **unstyled stub**: data is wired, there is no design. The new design system has not been decided yet.
- Until the new design system is written into the "Design system" section below, **do not add styling or invent a visual direction.** Build only what the spec asks for.
- `redesign/` holds old HTML prototypes. They are kept for reference only. **Do not design from them.**

---

## Tech stack

- **Framework:** Next.js 14, App Router (`/app`)
- **Database:** Supabase (Mumbai / ap-south-1)
- **Styling:** Tailwind CSS 3.3+ (`tailwind.config.js` is CommonJS `module.exports`; theme is empty pending v2 tokens)
- **Hosting:** Vercel (auto-deploys `main`; branches get preview URLs)
- **Newsletter:** Kit / ConvertKit via `/api/subscribe`
- **Analytics:** PostHog via CDN snippet (`components/PostHogScript.tsx`, rendered in the root layout)
- **Repo:** github.com/tarangabtw-ctrl/bohemo (public)

---

## Critical build quirk

**`npm run dev` is broken. Do not use it.** Verify with:

```bash
npm run build && npm run start
```

Never commit code that doesn't pass `npm run build`.

---

## Architecture: what lives where

| Path | What it is | Rule |
|---|---|---|
| `lib/queries.ts` | **All** Supabase reads (tools, news), with seed fallback | Pages fetch only through these functions. Add new queries here, not inline in pages. |
| `lib/data.ts` | Seed data used when Supabase is unconfigured or a query fails | Do not expand. Do not use as a substitute for real data. |
| `lib/supabase.ts` | Supabase client (null when env vars missing) | Don't change. |
| `lib/seo.ts` | `buildMetadata()` — canonical, Open Graph, Twitter for every page | Every page exports metadata via this helper. |
| `lib/analytics.ts` | `track(event, props)` — PostHog capture | Use from client components. Keep v1 event names (listed in the file). |
| `lib/subscribe.ts` | Client newsletter signup → `/api/subscribe` | Reuse; don't re-implement fetch logic in components. |
| `app/api/subscribe/route.ts` | Writes to Supabase `subscribers` + Kit | Backend. Don't touch unless the spec says so. |
| `app/sitemap.ts`, `app/robots.ts` | SEO | Update the sitemap when adding routes. |
| `components/` | UI components | Currently only `NewsletterForm` (unstyled) and `PostHogScript`. |
| `types/index.ts` | `Tool`, `NewsArticle`, `Subscriber`, categories, price types | Extend here; no `any`. |

JSON-LD (`WebSite`, `Organization`, `SoftwareApplication`, `Article`) is rendered on the home, tool and article pages. Keep it when redesigning those pages.

---

## Supabase tables

All tables have Row Level Security (RLS) enabled.

### `tools`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | |
| slug | text | unique |
| description | text | |
| url | text | |
| category | text | |
| price_type | enum | free / freemium / paid / open-source |
| price_label | text | |
| tags | text[] | |
| region_relevance | text[] | |
| verified | boolean | |
| created_at | timestamptz | |

### `news`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | |
| excerpt | text | |
| url | text | unique |
| source | text | |
| category | text | |
| region | text | |
| published_at | timestamptz | |
| created_at | timestamptz | |

### `subscribers`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | unique |
| created_at | timestamptz | |

**Important:** Tables may have 0 rows. Always handle empty states gracefully in the UI — never show a broken page because the database is empty. Design for the empty state first.

---

## Design system

**Not yet defined.** When the v2 design system is approved, its tokens (color, type, spacing, radius, components) go here and into `tailwind.config.js`. Until then: no styling work.

Fixed regardless of design: the wordmark is `bohemo.` (lowercase, with period).

---

## File and folder conventions

- Pages: `/app/[route]/page.tsx` (default export)
- Reusable components: `/components/` (named exports)
- TypeScript (`.ts` / `.tsx`) for all files
- Every page and component handles empty, loading and error states

---

## Git rules

- All work on named branches. Never push to `main`; Taranga merges manually after review.
- Commit after each task, each commit builds. Descriptive messages: `feat: tools directory grid`
- Don't squash unrelated changes into one commit.
- Don't modify `.gitignore`, `.env*`, or `next.config.js` unless the spec requires it.

---

## NEVER do these things

1. Never run `npm run dev`.
2. Never install npm packages unless the spec lists them.
3. Never modify the Supabase schema (no ALTER TABLE, new tables, or migrations) unless the spec says to.
4. Never delete files outside the scope of the current task.
5. Never refactor code you weren't asked to touch.
6. Never use `any` — use proper types or `unknown`.
7. Never hard-code data that should come from Supabase.
8. Never use `localhost` URLs in committed code.
9. Never modify environment variables or `.env.local`.
10. Never reintroduce v1 brand tokens or design from `redesign/` prototypes.

---

## When something goes wrong

1. Build fails → read the error, fix it, rebuild.
2. Supabase returns nothing → render a clean empty state, never crash.
3. Unsure → do less, not more.
4. Task too big for one commit → split it; every commit builds.

---

## Quality checklist (before final commit)

- [ ] `npm run build` passes with zero errors
- [ ] Empty / loading / error states handled
- [ ] Nothing breaks below 640px
- [ ] Data comes through `lib/queries.ts`, metadata through `lib/seo.ts`
- [ ] No `console.log` left in committed code
