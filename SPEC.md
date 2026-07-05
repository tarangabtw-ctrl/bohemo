# SPEC.md — Homepage Live Content Swap

## Overview

Replace the three static "Launching soon" / "Coming later" platform cards on the homepage with live data from Supabase. The homepage currently shows promises. After this task, it shows proof.

**Important:** The homepage is currently rendered using legacy plain CSS inside `app/globals.css` (not Tailwind). The existing homepage structure may be in `app/page.tsx` or a homepage component. Find the existing homepage code first — do NOT create a duplicate. Edit what exists.

---

## Task 1: Tool of the Week card

### What it does
Replace the first platform card ("AI Tools Directory" / "Launching soon") with a live "Tool of the Week" card that pulls the most recently added tool from the `tools` table.

### Data fetching
- Query: `SELECT * FROM tools ORDER BY created_at DESC LIMIT 1`
- Fetch server-side (this is a Next.js App Router page — use server components, no `useEffect`)
- Import the existing Supabase client from wherever it already lives in the codebase (check `/lib/`, `/utils/`, or `app/` for an existing `supabase.ts` or `createClient` file). If no Supabase client exists yet, create one at `/lib/supabase.ts` using `@supabase/supabase-js` (already in package.json) with `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Display
Keep the same card structure (`.platform-card` CSS class). Change the content to:

```
Icon: 🗂 (keep the same)
Label: "TOOL OF THE WEEK" (small pill above the title, use .platform-card-tag styling)
Title: [tool.name]
Body: [tool.description] (truncate to 120 characters with "…" if longer)
Bottom row: [tool.category] pill + [tool.price_label] pill
Tag: "Explore tools →" (link to /tools page)
```

### Empty state (0 rows in tools table)
If Supabase returns no tools, show the original static card content:
```
Icon: 🗂
Title: AI Tools Directory
Body: A curated, opinionated catalog of the best AI tools by category, use case, and price.
Tag: "Launching soon"
```
This must look identical to the current card. The user should never see a blank card or an error.

---

## Task 2: Latest News Headlines

### What it does
Replace the second platform card ("AI News Feed" / "Launching soon") with a live card showing the 3 most recent news headlines from the `news` table.

### Data fetching
- Query: `SELECT title, source, published_at, url FROM news ORDER BY published_at DESC LIMIT 3`
- Same server-side fetch pattern as Task 1

### Display
Keep the `.platform-card` CSS class. Change the content to:

```
Icon: 📡 (keep the same)
Label: "LATEST" (small pill)
Title: AI News Feed

Then 3 news items, each as:
  - [news.title] (font-weight: 600, font-size: 14px, color: var(--black))
  - [news.source] · [relative time, e.g. "2h ago" or "3d ago"] (font-size: 12px, color: var(--text-muted))
  - A thin border-bottom between items (1px solid var(--border)), no border on the last item

Tag: "Read more →" (link to /news page)
```

### Relative time formatting
Write a small utility function (e.g., `formatRelativeTime(date: string): string`) in the same file or in `/lib/utils.ts`. Do NOT install any date library. Use basic JS:
- Under 1 hour: "Xm ago"
- Under 24 hours: "Xh ago"
- Under 7 days: "Xd ago"
- Otherwise: "Mon DD" format (e.g., "Jul 03")

### Empty state (0 rows in news table)
If Supabase returns no news, show the original static card content:
```
Icon: 📡
Title: AI News Feed
Body: Curated AI news with an explicit India and Southeast Asia lens.
Tag: "Launching soon"
```

---

## Task 3: Keep the Agents Marketplace card

### What to do
Leave the third card ("AI Agents Marketplace" / "Coming later") exactly as it is. Do not change it. This is a future product — it stays as a static promise card.

---

## Technical constraints

1. **Do not break the existing homepage layout.** The platform-grid is a 2-column CSS grid where the third card spans both columns. This must remain the same.
2. **Do not modify `tailwind.config.js` or install new packages.**
3. **Use the existing CSS classes** (`.platform-card`, `.platform-card-icon`, `.platform-card-title`, `.platform-card-body`, `.platform-card-tag`). Add new CSS rules in `globals.css` ONLY if the existing classes don't cover a new element (like the news item rows). Append new CSS to the end of the file — do not reorganize existing CSS.
4. **Server-side data fetching only.** No `"use client"`, no `useState`, no `useEffect` for data fetching. This is a Next.js 14 App Router server component.
5. **TypeScript types.** Define types for `Tool` and `NewsItem` either inline or in a `/types/` folder. No `any`.
6. **Links:** "Explore tools →" links to `/tools`. "Read more →" links to `/news`. Use Next.js `<Link>` from `next/link`.

---

## Mobile behavior

The existing responsive CSS already handles the grid collapse (`@media max-width: 900px` sets `grid-template-columns: 1fr`). No additional mobile work is needed — just make sure the news items inside the card don't overflow. Set `overflow: hidden` and `text-overflow: ellipsis` on news titles if they're long, with `white-space: nowrap` (single-line titles).

---

## Verification steps (run these before committing)

1. `npm run build` — must pass with zero errors
2. `npm run start` — open localhost:3000, verify:
   - If Supabase has data: tool card shows real tool, news card shows real headlines
   - If Supabase has no data: both cards show original static content (no blank cards, no errors)
   - Third card (Agents Marketplace) is unchanged
   - Grid layout is correct: 2 columns on desktop, 1 column on mobile
   - No console errors in the browser
3. Commit with message: `feat: replace static platform cards with live supabase data`

---

## What NOT to do

- Do not touch any section of the homepage outside the platform-grid (hero, proof bar, why section, flywheel, newsletter, footer — all stay exactly as they are)
- Do not create a new page — this is an edit to the existing homepage
- Do not add loading spinners or skeleton states — this is server-rendered, data is available before the page loads
- Do not run `npm run dev` — it is broken
- Do not push to main — stay on the current branch
