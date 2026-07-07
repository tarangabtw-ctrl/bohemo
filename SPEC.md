# SPEC.md — Full-repo hardening pass (Fable 5 overnight run)

## Branch
Create from the branch with the LATEST work, not from main:
`git checkout overnight/detail-pages-seo-newsletter && git pull`
`git checkout -b fable/hardening-pass`

(If you've already merged that branch to main, branch off main instead.)

## Global rules — read CLAUDE.md in full first, then obey these too
- Verify EVERY task with `npm run build && npm run start`. NEVER run `npm run dev` — it is broken.
- Commit after each numbered task, one commit each. Descriptive message, e.g. `fix: add empty/error states to tools list`.
- Do NOT push. Do NOT merge. Leave the branch for me to review and merge.
- No schema changes: no ALTER TABLE, no migrations, no new tables.
- No new npm packages.
- Do not modify `.env*`, `next.config.js`, or `tailwind.config.js`. Do not reorganize the existing CSS block in `globals.css` (append only if truly unavoidable).
- No `any`. Use proper types or `unknown`. No `@ts-ignore`.
- No hardcoded data that should come from Supabase. No `console.log` left behind. No `localhost` URLs.
- Do not delete files. Do not refactor code outside a task's stated scope.
- If a task can't be completed cleanly, skip it, commit what is safe, and note why in the commit message. Do not force it.

## Explicitly OUT of scope — do not touch
- The news-card internal-vs-external linking decision — leave exactly as-is. It's an open product call, not yours to make.
- Agents marketplace / Bohemo Verified — not in this run.
- Any redesign or copy rewrite. This run is correctness only, not aesthetics.

## Tasks (in order, one commit each)

### 1. Empty / loading / error states
For every component that reads from Supabase (tools list, tool detail, news list, news detail, and any homepage section that fetches), ensure three states render cleanly:
- Loading: a simple skeleton or "Loading…" in brand tokens.
- Empty (0 rows): a clean message, never a broken layout.
- Error (fetch throws): a graceful fallback, never a crashed/white-screen page.
Acceptance: reason through each data fetch; no route can white-screen on empty or failed data. Build passes.

### 2. Type safety sweep
Remove every `any` in the codebase. Add proper TypeScript types for the Supabase row shapes (tools, news, subscribers) in a shared types file if one does not already exist, and import them wherever rows are used.
Acceptance: `npm run build` passes; no `any` remains in touched files.

### 3. SEO metadata correctness
Every public route exports proper metadata: unique title, description, canonical URL, OpenGraph (title, description, type, url, image), and Twitter card. Add JSON-LD: Organization on the homepage; Article on news detail pages. Keep all JSON-LD valid.
Ensure the sitemap lists all public routes and `robots.txt` is consistent with it.
Acceptance: each route has metadata; sitemap covers all public pages; no duplicate or missing canonicals. Build passes.

### 4. Broken links & assets
Fix only unambiguously broken things: dead internal `href`s, broken image `src` paths, missing referenced assets. Do NOT change the news internal/external linking decision (see out-of-scope).
Acceptance: no broken internal links or 404 image paths remain. Build passes.

### 5. Mobile / responsive audit
Check every page below 640px (test at 375px). Fix horizontal overflow, overlapping elements, and unusable tap targets. Confirm the nav and the newsletter form work on mobile.
Acceptance: no horizontal scroll at 375px; all sections stack correctly. Build passes.

### 6. Accessibility pass
- Every image has meaningful `alt` (use empty `alt=""` for purely decorative images).
- Icon-only buttons/links have an accessible name via `aria-label`.
- Exactly one `<h1>` per page; heading order is logical (no skipped levels).
- The newsletter email input has an associated `<label>` (visually hidden is fine).
Acceptance: images have alt, interactive elements have accessible names, heading order is clean. Build passes.

## Final step
Run `npm run build && npm run start` one last time to confirm the whole app builds and boots. Leave the branch unpushed for my review.
