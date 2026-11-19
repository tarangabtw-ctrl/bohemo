# LAUNCH-AUDIT.md: from redesign/v2 to a public launch on bohemoai.com

Written 19 Nov 2026 on branch `redesign/v2`, after SPEC.md Tasks 1–10. Based on PROGRESS.md, SPEC.md, CLAUDE.md, the Claude Design handoff bundle, the code, the `main` branch, and read-only queries against the live Supabase database.

**In one line:** the site is designed and wired. To launch, we still need to build the news pipeline, fix a few bugs, load the real tool data, have you write the placeholder copy and the legal pages, check everything on the preview, then merge and point the domain.

## How to read this

- **Build time** is rough Claude Code time. It doesn't count your time for writing or approvals.
- **Risk:** low = small and contained; medium = touches shared code or needs a careful check; high = schema, live data, or a new moving part.
- **Owner:**
  - **You**: Taranga.
  - **CC**: Claude Code.
  - **Both**: CC builds, you decide, approve or write copy.

## What the database looks like today (read-only check, 19 Nov 2026)

| Table | Rows | Notes |
|---|---|---|
| `tools` | 10 | No row has `last_checked` or `verified_at` set, so every Local Fit meter is empty. `tools.csv` has 20 rows. |
| `news` | 5 | None has `edition_date`, and every `tools_mentioned` is empty. The Signal shows its "not out yet" state. |
| `subscribers` | 5 | The `subscribers_insert` policy is still there. |
| `submissions` | 0 | No policies, as intended. |

- `anon` and `authenticated` still have SELECT on `subscribers` and `submissions`. The REVOKE hasn't been run on either table.

---

## 1. Not built yet

| # | Item | What's left | Build time | Risk | Depends on | Owner |
|---|---|---|---|---|---|---|
| 1.1 | **Task 11: news pipeline** | See the breakdown below. | ~2 days total | High | Your RSS source list, Anthropic API key, schema approval, admin password | Both |
| 1.1a | Schema migration | Add a stored `edition_number` and the queue fields (status: queued / approved / rejected, score, source feed). A schema change, so it needs your written OK first. | ~1h | High | Your approval | Both |
| 1.1b | RSS fetch and parse | Read each feed and skip URLs already in `news` (`url` is unique). No new npm package is approved, so this means a small parser we write ourselves; adding a package needs your OK. | ~3h | Medium | 1.1a, source list | CC |
| 1.1c | Haiku scoring and `tools_mentioned` | Score each item for relevance to India/SEA. Fill `tools_mentioned` with **slugs** matched against `tools.slug`, never names. Draft `why_it_matters`. | ~3h | Medium | 1.1b, Anthropic key | CC |
| 1.1d | `/admin/news` approval queue | Approve, reject, edit the excerpt and "why it matters", pick 7 and order them. Protected by a password check in middleware (new server-only env var). There is no sign-in system yet. Not in the sitemap, and `noindex`. | ~4h | High | 1.1a–c, admin password | CC |
| 1.1e | Publish an edition | Writes `edition_date`, `edition_rank` 1–7 and the stored edition number. The Signal, the archive and article pages read the stored number. | ~2h | Medium | 1.1d | CC |
| 1.1f | Schedule | Vercel Cron runs the import before 8:00 IST. The cron route is protected with a secret. | ~1h | Low | 1.1b–c | CC |
| 1.2 | Discord link in the footer | Add a "Discord" link to the footer's Follow column from a new `NEXT_PUBLIC_DISCORD_URL` setting, hidden when unset. **Note:** today's footer has no Discord link at all (no `href="#"`), so this adds one rather than replacing one. | ~20 min | Low | Your Discord invite URL | Both |
| 1.3 | "Join the community" in The Signal | A link after "You're caught up", from the same setting, hidden when unset. "You're caught up" appears in two places, and the link goes in both: `components/news/EditionReader.tsx:141` and `app/news/[id]/page.tsx:241`. Adds a new PostHog event `community_link_click`, alongside the v1 names. | ~30 min | Low | 1.2 | CC |
| 1.4 | Search placeholders in the market's language | SPEC asks for the local language first, then English (India: English, Hindi, Bengali). Today every placeholder is English. Needs `lang` attributes so the right font and type rules apply. | ~2h | Medium | 3.3, native-speaker check (4.12) | Both |
| 1.5 | Terms, Privacy and Refund pages | Page shells at `/terms`, `/privacy` and `/refunds`, plus sitemap, footer links, and Sign-in's `[TERMS]` / `[PRIVACY POLICY]` links. Dodo needs all three before it will activate. | ~1h | Low | Your text (4.9) | Both |

---

## 2. Built, but not yet checked against real data or in a browser

The steps that write rows (forms, newsletter) are yours, on the Vercel preview. Per CLAUDE.md, CC never writes to the database to test. CC can smoke-test the rest with `npm run build && npm run start` and mocked data, and fix what it finds.

| # | Item | How to check | Build time (fixes) | Risk | Depends on | Owner |
|---|---|---|---|---|---|---|
| 2.1 | Forms → `submissions` | The PROGRESS.md checklist: Report a mistake, Pro waitlist (annual + monthly, GSTIN in capitals), Expense it, Submit your tool, Talk to us, Agency. One row each, the right `type` and payload. | ~1h if something breaks | Medium | Preview deploy | You |
| 2.2 | Honeypot | No second rows from 2.1. Browser autofill must not fill the hidden `fax_only` field. | — | Low | 2.1 | You |
| 2.3 | Newsletter (ready to test now; Kit fixed 18 Nov) | A real address shows up in Kit under form 9333668, plus one `subscribers` row, plus "You're in…". The same address again gives "You're already on the list…". | ~30 min if something breaks | Low | Preview deploy | You |
| 2.4 | Layouts at 390px (and 360px) | Every route: Home, Tools, tool page, Compare (swipe tabs), News, archive, article, Pricing, Get listed, How we rate, About, Saved, Sign-in, 404. Bottom tab bar; nothing breaks below 640px. | ~2–4h of fixes | Medium | — | Both |
| 2.5 | Search keyboard | ⌘K and `/` open search, arrows move, Enter opens, Escape closes and focus returns. Recent searches persist on the device. | ~1h | Low | — | Both |
| 2.6 | Onboarding | First Home visit: mobile sheet (focus trap, focus returns), desktop card, toast. Shows only once. | ~1h | Low | — | Both |
| 2.7 | Waitlist auto-open | `/pricing?waitlist=1` opens the form, and every Get Pro button links there. | ~30 min | Low | — | Both |
| 2.8 | Saved tabs | Tools and Stories tabs, the 20-save meter, the sign-in nudge after 3 saves, the full state with Get Pro, persistence across pages. | ~1h | Low | — | Both |
| 2.9 | The Signal with a real edition | Tabs, "3 of 7 read", "You're caught up", "Next story", `/news/archive/<date>`, the 7-day free cut-off. | ~1h | Medium | 1.1 | Both |
| 2.10 | Font budget | Total font transfer on throttled 4G, on Home and on an article (SPEC requirement). | ~1h | Low | 3.3 | CC |
| 2.11 | Contrast and focus | WCAG AA spot-check of text, meters and focus rings, especially on charcoal surfaces. | ~1h | Low | — | CC |
| 2.12 | PostHog | Events arrive in PostHog from the preview with the right properties. | ~30 min | Low | Preview deploy | You |
| 2.13 | Service-role writes | One Report a mistake and one Pro waitlist land as rows. This proves the server-only write works now that the public key can't insert. | — | Low | 2.1 | You |

---

## 3. Known bugs and pre-launch fixes

| # | Item | What's wrong / what to do | Build time | Risk | Depends on | Owner |
|---|---|---|---|---|---|---|
| 3.1 | Real 404 for unknown `/tools/[slug]` and `/news/[id]` | Today they show the not-found page with `noindex` but return status 200. The route's `loading.tsx` starts streaming before `notFound()` runs. Fix the loading boundary so the status is a real 404, and check both routes with `curl -I`. | ~2h | Medium | — | CC |
| 3.2 | Stored edition numbers | Edition numbers are calculated today. Switch to the stored number from 1.1e. | ~1h | Low | 1.1a, 1.1e | CC |
| 3.3 | Font fallback | `lib/fonts.ts` defines the Devanagari, Bengali, Thai and Vietnamese fonts, but no page loads them. The only `lang` attribute is `<html lang="en">`. So the `:lang()` rules in `globals.css` never fire, and any script text falls back to system fonts. Fix: load each script font only on the segments that show that script, and put `lang` on that text. | ~2–3h | Medium | — | CC |
| 3.4 | Stale tool data | Only 10 of the 20 tools in `tools.csv` are in the database. The 10 that are have old prices and URLs (e.g. ChatGPT `$20 mo`, `chat.openai.com`), and none have Local Fit fields, so every meter reads "0 confirmed". | ~2h (SQL) | High | Backup first (below) | Both |
| 3.4a | ↳ Backup first | **Before the import runs**, export `tools`, `news` and `subscribers` to CSV from the Supabase dashboard. The free plan has no point-in-time restore. The import waits until this is done. | ~10 min | Low | — | You |
| 3.4b | ↳ Import | CC writes the insert/update SQL from `tools.csv`: languages, payment methods, local pricing, `made_in_asia`, `last_checked`. You read it and approve before it runs, because it writes to the live database. The old `verified` column still never drives the Verified badge. | (in 3.4) | High | 3.4a, your approval | Both |
| 3.5 | Kit settings | **Fixed 18 Nov 2026, needs a check on the preview.** v3 API key, `CONVERTKIT_FORM_ID=9333668`, API secret regenerated, set for Production and `redesign/v2`, preview redeployed. What's left is check 2.3. | — | Low | 2.3 | You |
| 3.6 | Footer socials | LinkedIn (`linkedin.com/company/bohemo`) and X (`x.com/bohemo`) point at accounts nobody has confirmed. Confirm them, or hide them until they're real. | ~10 min | Low | 4.7 | Both |
| 3.7 | Repo leftovers | `netlify.toml` is still in the repo (hosting is Vercel). The root `index.html` and `index.html assets/` are v1 leftovers. Your call whether they go. Nothing gets deleted without your OK. | ~10 min | Low | Your decision | Both |

---

## 4. Placeholders and decisions only you can make

Once you've written the text, putting each one into the code takes CC about 15–30 minutes. Never invent numbers or quotes: anything left unanswered stays as a visible `[PLACEHOLDER]`, and launch waits for it.

| # | Item | Where | Risk if launched as-is | Depends on | Owner |
|---|---|---|---|---|---|
| 4.1 | Featured and Verified prices: `[FEATURED PRICE]`, `[PERIOD]`, `[VERIFIED PRICE]`, `[MARKETS / CATEGORIES]`, `[SLOTS PER PAGE]`, the example `[CATEGORY]` / `[PRICE]` | `components/pricing/ForCompanies.tsx` | High (the page sells nothing) | 4.13 | You → Both |
| 4.2 | FAQ answers: cancel, refunds, student price, team billing, data | `components/pricing/PricingView.tsx:53` | High | 4.9 | You → Both |
| 4.3 | `[REPLY TIME]` on Talk to us | `components/getlisted/TalkToUsForm.tsx:92` | Medium | — | You → Both |
| 4.4 | About: "How Bohemo works", plus the three blocks on how stories are chosen, how a tool gets scored, and our sources, plus the example correction (`[DATE]`, `[WHAT WE GOT WRONG]`, `[WHAT IS RIGHT]`) | `app/about/page.tsx` | High | 1.1 (sources) | You → Both |
| 4.5 | How we rate: `[DATE]` (×2), `[WHO SCORES]`, `[TEST DEVICE + CONNECTION]`, `[HOW WE CONFIRM WHEN THEY ARE UNCLEAR]` | `app/how-we-rate/page.tsx` | High (it's a trust page) | — | You → Both |
| 4.6 | Contact emails: editorial, corrections, press | `app/about/page.tsx:71–73` | Medium | Mailboxes set up | You → Both |
| 4.7 | Socials: Discord invite URL, plus confirm or drop LinkedIn and X | Footer, 1.2, 3.6 | Low | — | You |
| 4.8 | SEA payment methods: `[+ SEA METHODS IF SUPPORTED]` | `components/pricing/PricingView.tsx:202` | Medium | What Dodo supports | You → Both |
| 4.9 | Terms, Privacy and Refund text. **Dodo needs these before it activates.** | 1.5 | High | Possibly a lawyer | You |
| 4.10 | Dodo GST invoice question: can Dodo issue GST invoices for us? The "Company and GSTIN saved for your invoice" row on Pricing and the Expense it copy depend on the answer. | `PricingView.tsx:50`, `components/pricing/ExpenseIt.tsx` | Medium | Dodo account | You → Both |
| 4.11 | Pro at launch: stay waitlist-only (recommended) or wait for Dodo | — | — | 4.9, 4.10 | You |
| 4.12 | Native-speaker checks for every Hindi, Bengali, Thai, Vietnamese, Bahasa and Filipino string, including the 1.4 placeholders | Search, markets | Medium | 1.4 | You |
| 4.13 | **Vercel plan.** The Hobby plan doesn't allow commercial use. Upgrade to Vercel Pro before Bohemo takes any money: sponsored listings, Featured/Verified, or Pro. **Trigger: the first paid deal** (signed or invoiced, whichever comes first). About 10 minutes in the Vercel dashboard. | Vercel dashboard | High if missed | First paid deal | You |

---

## 5. Merge and deploy steps (do them in this order)

| # | Step | Details | Time | Risk | Depends on | Owner |
|---|---|---|---|---|---|---|
| 5.1 | Final build | `npm run build` passes on `redesign/v2`, and the CLAUDE.md quality checklist is ticked. | ~30 min | Low | Groups 1–4 done | CC |
| 5.2 | PR `redesign/v2` → `main` | CC opens the PR; you review and merge. CC never pushes to `main`. | ~30 min | Medium | 5.1 | Both |
| 5.3 | Remove the coming-soon setup | `main` has a `middleware.ts` that redirects every page to `/`. It must not survive the merge, or the whole site keeps redirecting to the home page. The v2 home replaces main's coming-soon `app/page.tsx`. Resolve the merge conflicts in v2's favour. | (in 5.2) | High | 5.2 | Both |
| 5.4 | Vercel Production settings | `SUPABASE_SERVICE_ROLE_KEY` is **already set**, just confirm it. `CONVERTKIT_API_KEY` and `CONVERTKIT_FORM_ID` are **already set** (18 Nov), just confirm them. Add: `NEXT_PUBLIC_SITE_URL=https://bohemoai.com`, `NEXT_PUBLIC_DISCORD_URL`, `NEXT_PUBLIC_AGENCY_URL` (optional), `ANTHROPIC_API_KEY`, the admin password and the cron secret. Check the Supabase URL and anon key point at the Mumbai project. | ~20 min | Medium | — | You |
| 5.5 | Domain | Add bohemoai.com to the Vercel project, redirect www to the apex (or the other way round, pick one), and check HTTPS. Then check canonical URLs, `robots.txt` and `sitemap.xml` all use bohemoai.com. | ~30 min + DNS wait | Medium | 5.4 | You |
| 5.6 | Database lock-down | Right after main deploys: `DROP POLICY IF EXISTS "subscribers_insert" ON public.subscribers;` and `REVOKE SELECT ON public.subscribers, public.submissions FROM anon, authenticated;`. Neither has been done yet. These are database changes, so you approve them first. | ~10 min | Medium | 5.3 deployed | Both |
| 5.7 | Live smoke test | Every route loads. Unknown tool and article give a real 404. One form and one newsletter signup land as one row each. PostHog receives events. Submit the sitemap in Google Search Console. | ~1h | Low | 5.5, 5.6 | Both |
| 5.8 | Rollback plan | If anything breaks: Vercel instant rollback to the previous deployment. The coming-soon version of `main` stays at commit `9ee7577`. | — | Low | — | You |

---

## Post-launch only (not in V1)

| Item | When |
|---|---|
| **In-site community:** first user reviews and Local Fit confirmations on tool pages, then forums. Until then, V1 links to the external Discord (1.2, 1.3). | **Trigger:** about 1,000+ Discord members **and** 50+ people posting each week, sustained for a month. |
| Real checkout with Dodo (UPI AutoPay, cards), and the founding counter (it shows once real paid members exist) | After Dodo activates (needs 4.9, 4.10) and Vercel Pro (4.13). |
| Real sign-in and accounts (Saved across devices) | After launch. |
| Cloning Stacks (the `stack_cloned` event is already reserved) | After launch. |
| Agents marketplace | Not in this codebase yet. |

---

## Running cost of the news pipeline (Haiku scoring)

| Volume | Articles a month | Rough cost |
|---|---|---|
| 50 a day | ~1,500 | ~$0.75 ≈ **₹65 a month** |
| 100 a day | ~3,000 | ~$1.50 ≈ **₹130 a month** |

- **Model:** Claude Haiku 5.5 (`claude-haiku-5-5`) at list price: $0.10 per million input tokens and $0.50 per million output tokens.
- **Assumptions:** about 2,000 input tokens per article (instructions, title and excerpt, the tool slug list) and about 600 output tokens (score, reasons, slugs, thinking).
- **Exchange rate:** about ₹88 to the dollar, before any GST on the invoice.
- Set a **₹500 a month spend limit** in the Anthropic Console as a safety cap. After the first week, check the real number from the usage figures.

---

## Suggested order of work

1. **You:** start group 4 now, especially 4.9 (legal text), 4.1, 4.2, 4.4 and 4.5. They hold up the most work. Send the Discord URL (4.7) and the RSS source list (1.1).
2. **CC:** quick fixes on the branch: 3.1 (404 status), 3.3 (fonts), 1.2 and 1.3 (Discord links), 1.5 (legal page shells). One commit each.
3. **You, then CC:** back up the tables (3.4a). CC writes the tool import, you approve it, then it runs (3.4b).
4. **You approve the schema, CC builds:** Task 11 (1.1a–f) plus stored edition numbers (3.2). Then publish one real edition through `/admin/news`.
5. **CC:** search placeholders in the market language (1.4), after the native-speaker check (4.12).
6. **Both:** put your group 4 text into the code. Fix anything from group 2's layout, keyboard and contrast pass.
7. **You on the preview:** group 2 checks that write rows (2.1–2.3, 2.9, 2.12, 2.13).
8. **Both:** merge and deploy, 5.1 → 5.8. Then launch.
9. **After launch:** upgrade to Vercel Pro at the first paid deal (4.13), and watch the Discord numbers for the community trigger.

**Rough total:** about 4–5 Claude Code working days (Task 11 is about half), plus your writing, approvals and the preview checks.
