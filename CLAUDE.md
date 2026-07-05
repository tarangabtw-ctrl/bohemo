# CLAUDE.md — bohemo. project constitution

## What this project is

bohemo. (lowercase, with period — this is intentional branding, not a typo) is an AI ecosystem and marketplace for India and Southeast Asia. Think "the Bloomberg of AI for the Global South." It has three live surfaces: an AI tools directory, an AI news feed, and a homepage/landing page. There is also a marketing agency arm and a future agents marketplace, but those are not part of the codebase.

The founder is non-technical. You are the engineering team. Write clean, conventional code. Do not get clever. Do not refactor things you were not asked to touch.

---

## Tech stack

- **Framework:** Next.js 14, App Router (`/app` directory)
- **Database:** Supabase (project region: Mumbai / ap-south-1)
- **Styling:** Tailwind CSS 3.3+ (configured, `tailwind.config.js` is CommonJS `module.exports`)
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Newsletter:** Kit / ConvertKit
- **Analytics:** PostHog
- **Fonts:** Inter (body, via Google Fonts), Poppins Bold (wordmark only)
- **Repo:** github.com/tarangabtw-ctrl/bohemo (public)

---

## Critical build quirk

**`npm run dev` is broken. Do not use it.**

Always verify your work with:

```bash
npm run build && npm run start
```

If the build fails, fix it before doing anything else. Never commit code that doesn't pass `npm run build`.

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

## Brand tokens (mandatory)

| Token | Value |
|-------|-------|
| Cream (background) | `#F0EDE6` |
| Ink (primary text, buttons) | `#0D0D0D` |
| Muted (secondary text) | `#6B6560` |
| Cream dark | `#E8E4DC` |
| Cream mid | `#EBE7DF` |
| Pill background | `#E3DFD7` |
| Border | `rgba(13,13,13,0.10)` |

### Design rules
- No gradients. Ever.
- No box shadows. Ever.
- No bright accent colors. The palette is cream and ink only.
- Border radius: pills are `rounded-full`, cards are `rounded-2xl` or `rounded-xl`
- Font weights: 400 (body), 500 (subtle emphasis), 600 (labels), 700 (subheads), 800 (headlines), 900 (stats/numbers)
- Letter spacing: headlines get `tracking-tight`, body text stays default
- The aesthetic is: Stripe's cleanliness meets Rest of World's editorial seriousness

---

## Styling rules

The codebase uses both Tailwind utility classes AND a legacy plain CSS block in `app/globals.css` (from the original homepage). Follow these rules:

1. **New components:** Always use Tailwind utility classes. No new plain CSS.
2. **Existing homepage components:** If editing homepage sections that use the legacy CSS, keep using that CSS — don't half-migrate to Tailwind.
3. **globals.css:** Do not remove or reorganize the existing CSS in this file. Only append if absolutely necessary.
4. **Tailwind config:** Do not modify `tailwind.config.js` unless the spec explicitly asks for it.

---

## File and folder conventions

- Pages go in `/app/[route]/page.tsx`
- Reusable components go in `/components/`
- Supabase client utilities go in `/lib/` or `/utils/`
- Use TypeScript (`.tsx` / `.ts`) for all new files
- Use named exports for components, default exports for pages

---

## Git rules

- Do not push to `main` unless explicitly told to
- Use descriptive commit messages: `feat: add tool-of-the-week card to homepage`
- Do not squash unrelated changes into one commit
- Do not modify `.gitignore`, `.env`, or `next.config.js` unless the spec requires it

---

## NEVER do these things

1. **Never run `npm run dev`** — it is broken and will waste your turns debugging a known issue
2. **Never install new npm packages** without the spec explicitly listing them
3. **Never modify the Supabase schema** (no ALTER TABLE, no new tables, no migration files) unless the spec says to
4. **Never delete existing files** — only create or edit
5. **Never refactor code you weren't asked to touch** — scope creep is the enemy of overnight runs
6. **Never use `any` as a TypeScript type** — use proper types or `unknown`
7. **Never hard-code data** that should come from Supabase — always fetch from the database
8. **Never use `localhost` URLs in committed code** — use environment variables or relative paths
9. **Never modify environment variables or `.env.local`**

---

## When something goes wrong

1. If the build fails: read the error, fix it, run `npm run build` again
2. If Supabase returns no data: your component should render a clean empty state, not crash
3. If you're unsure about something: err on the side of doing less, not more
4. If a task feels too big for one commit: break it into smaller commits, each of which builds successfully

---

## Quality checklist (run before final commit)

- [ ] `npm run build` passes with zero errors
- [ ] All new components handle empty/loading/error states
- [ ] Mobile responsive (nothing breaks below 640px)
- [ ] Brand tokens used correctly (no off-palette colors)
- [ ] No `console.log` left in committed code
- [ ] No hardcoded data that should come from Supabase
