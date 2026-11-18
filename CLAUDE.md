# CLAUDE.md — Bohemo project constitution (v2)

## What this project is

**Bohemo** (capital B, no full stop) is an AI ecosystem and marketplace for India and Southeast Asia: "the Bloomberg of AI for the Global South." Live surfaces: homepage, AI tools directory (with tool detail and compare), and AI news feed (with article pages). The agency arm and agents marketplace are not in this codebase yet.

**The name is always `Bohemo`.** The old lowercase `bohemo.` (with a full stop) is retired. Never use it in code, copy, metadata, alt text, JSON-LD or commit messages. If you find it anywhere you are already editing, change it to `Bohemo`.

The founder is non-technical. You are the engineering team. Write clean, conventional code. Do not get clever. Do not touch things you were not asked to touch.

---

## Current state: v2 redesign in progress

- The entire v1 UI was scrapped on branch `redesign/v2`. v1 is preserved at git tag `v1-final`.
- The old brand (cream/ink palette, Inter, "no shadows" rules) is **retired**. Do not reintroduce it.
- Every page is currently an **unstyled stub**: data is wired, there is no design yet.
- The v2 design system **is decided**. It was built in Claude Design and arrives with the Claude Design handoff bundle. See the "Design system" section below.
- Style only with that design system's tokens and components. **Do not invent a visual direction** or add values that aren't in the tokens. Build only what the spec asks for.
- `redesign/` holds old HTML prototypes. They are kept for reference only. **Do not design from them.**

---

## Tech stack

- **Framework:** Next.js 14, App Router (`/app`)
- **Database:** Supabase (Mumbai / ap-south-1)
- **Styling:** Tailwind CSS 3.3+ (`tailwind.config.js` is CommonJS `module.exports`; theme gets the v2 design tokens from the handoff bundle)
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
| `lib/analytics.ts` | `track(event, props)` — PostHog capture | Use from client components. Keep the v1 event names (listed in the file); add new v2 events alongside them, never rename or remove old ones. |
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

**Source of truth:** the Bohemo design system in Claude Design, delivered with the Claude Design handoff bundle. Exact values (hex codes, type scale, spacing, radii, shadows) come from the bundle's tokens. They go into `tailwind.config.js` as the first task of the redesign. After that, use Tailwind theme classes only. **Never hand-type a hex value, font size or spacing value in a component.**

Fixed decisions (do not change without a spec):

- **Name:** `Bohemo`, capital B, no full stop.
- **Palette:** white → cream → light brown, chosen in Claude Design. Ink (body text, primary buttons) is the logo's charcoal.
- **Light browns:** surfaces, borders and tags only. Never use them for text, or for marks that carry meaning (Local Fit dots, edition progress, chart marks); those use the darker umber or ink. In the dot meters, filled = umber/ink and empty = light outline.
- **Semantic colours:** use the semantic tokens (positive, negative, warning, info), not ad-hoc greens or reds. The charcoal ticker has its own light "up" and "down" tokens.
- **Type:**
  - Display: Poppins.
  - Body/UI: Noto Sans, plus its script siblings.
  - Data (prices, dates, edition numbers, ticker): IBM Plex Mono.
  - Bengali: Noto Sans Bengali for body; the headline font follows the design system's final pick.
  - Poppins has no Bengali, Thai or Vietnamese, so those scripts fall back to the matching Noto font.
- **Font loading:**
  - Load fonts with `next/font`, so they are self-hosted. No runtime calls to Google Fonts.
  - Load Latin by default.
  - Devanagari, Bengali, Thai and Vietnamese load only on pages that use them (unicode-range subsets).
  - Fonts are the heaviest part of the page on 4G; keep the number of weights small.
- **Motif:** the logo's pills and dots. Pills for tags, filters, chips, toggles and buttons. Dots for ratings and progress. Loading skeletons are shaped like the logo's pill rows.
- **Logo:**
  - Use the SVG mark from the bundle; minimum 24px.
  - Under 24px, use the simplified square favicon (16px).
  - Clear space is one dot.
  - On charcoal, use the reversed or outline variant.
  - The wordmark is a PNG until a vector exists; never redraw it.
- **Accessibility:**
  - WCAG AA everywhere: 4.5:1 for text; 3:1 for large text, icons, focus rings and meaningful marks.
  - Touch targets at least 44px. Visible focus states.
  - Respect `prefers-reduced-motion`.
- **Never:** gradient washes, glassmorphism, emoji icons, left-border accent cards, stock photos of people, autoplay video.
- **Mobile first:** design and test at 390px; nothing breaks below 640px. Mobile has a bottom tab bar (Home · Tools · News · Saved).

Copy voice: founder-led, raw, honest, specific, short sentences. Bohemo says "we"; "I" appears only in the signed founder's note on Pricing. Banned words: revolutionary, unleash, supercharge, seamless, cutting-edge, game-changing, "the future of", "AI-powered". Never invent stats, testimonials, user counts or quotes. Use a `[PLACEHOLDER]` instead.

---

## File and folder conventions

- Pages: `/app/[route]/page.tsx` (default export)
- Reusable components: `/components/` (named exports)
- TypeScript (`.ts` / `.tsx`) for all files
- Every page and component handles empty, loading and error states

---

## Git rules

- All work on named branches. Never push to `main`; Taranga merges manually after review.
- Commit after each task and push the branch (never `main`). Each commit builds. Descriptive messages: `feat: tools directory grid`
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
11. Never write the name as `bohemo.` or `bohemo` in anything users see. It is `Bohemo`.
12. Never hand-type colours, font sizes or spacing; use the design tokens.
13. Never insert, update or delete rows in the Supabase database to test things. That includes sending valid data to `/api/submit` or `/api/subscribe`, because both write rows. Verify with `npm run build` and mocked data only. If a check truly needs the real database, stop and ask Taranga first.
14. Never run the dev server or any long-running watch command. `npm run start` is allowed only for a short smoke test; stop it as soon as the check is done.

---

## When something goes wrong

1. Build fails → read the error, fix it, rebuild.
2. Supabase returns nothing → render a clean empty state, never crash.
3. Unsure → do less, not more.
4. Task too big for one commit → split it; every commit builds.
5. The same error comes back 3 times → stop and report it. Don't keep trying.

---

## Quality checklist (before final commit)

- [ ] `npm run build` passes with zero errors
- [ ] Empty / loading / error states handled
- [ ] Nothing breaks below 640px
- [ ] Data comes through `lib/queries.ts`, metadata through `lib/seo.ts`
- [ ] No `console.log` left in committed code
- [ ] The name reads `Bohemo` everywhere; colours and type come only from design tokens
- [ ] Text and meaningful marks pass WCAG AA contrast
