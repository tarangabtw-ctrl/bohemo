import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS } from '@/lib/data'
import { SITE_URL, OG_IMAGE } from '@/lib/site'
import { PRICE_TYPES } from '@/types'
import type { Tool } from '@/types'
import type { Metadata } from 'next'
import CompareAnalytics from '@/components/CompareAnalytics'

const COMPARE_TITLE = 'Compare AI tools — bohemo.'
const COMPARE_DESCRIPTION = 'Compare AI tools side by side — pricing, categories, tags, and regional relevance for India and Southeast Asia.'

export const metadata: Metadata = {
  title: COMPARE_TITLE,
  description: COMPARE_DESCRIPTION,
  alternates: { canonical: '/tools/compare' },
  openGraph: {
    title: COMPARE_TITLE,
    description: COMPARE_DESCRIPTION,
    url: `${SITE_URL}/tools/compare`,
    siteName: 'bohemo.',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: COMPARE_TITLE,
    description: COMPARE_DESCRIPTION,
    images: [OG_IMAGE],
  },
}

interface Props {
  searchParams: { tools?: string }
}

async function getToolsBySlug(slugs: string[]): Promise<Tool[]> {
  if (slugs.length === 0) return []

  if (supabase) {
    try {
      const { data, error } = await supabase.from('tools').select('*').in('slug', slugs)
      if (!error && data) return data as Tool[]
    } catch {
      // fall through to seed data
    }
  }

  return SEED_TOOLS.filter((t) => slugs.includes(t.slug))
}

function priceLabelFor(tool: Tool) {
  return tool.price_label ?? PRICE_TYPES.find((p) => p.value === tool.price_type)?.label ?? tool.price_type
}

const ROW_LABEL = 'text-left align-top px-4 py-3 text-sm sm:text-xs font-semibold text-muted uppercase tracking-wide border-b border-black/[0.06]'
const CELL = 'align-top px-4 py-3 border-b border-black/[0.06]'

export default async function ComparePage({ searchParams }: Props) {
  const slugs = (searchParams.tools ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)

  const tools = await getToolsBySlug(slugs)
  // Preserve the order the user selected them in, not whatever order the DB returns
  const orderedTools = slugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is Tool => Boolean(t))

  if (orderedTools.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mb-3">
          Compare tools
        </h1>
        <p className="text-base text-muted">Pick 2 or 3 tools from the directory to compare.</p>
        <Link
          href="/tools"
          className="mt-6 inline-flex items-center justify-center min-h-[44px] rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
        >
          ← Back to directory
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <CompareAnalytics count={orderedTools.length} slugs={orderedTools.map((t) => t.slug)} />

      <Link
        href="/tools"
        className="inline-flex items-center gap-1 min-h-[44px] text-sm text-muted hover:text-ink transition-colors mb-8"
      >
        ← Back to directory
      </Link>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-8">
        Compare tools
      </h1>

      {/* Horizontal scroll is contained to this element only, never the whole page */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="w-32" />
              {orderedTools.map((tool) => (
                <th key={tool.slug} className="text-left align-top px-4 py-3 border-b border-black/10">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="inline-flex items-center min-h-[44px] text-base font-bold text-ink hover:underline decoration-1 underline-offset-2"
                  >
                    {tool.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className={ROW_LABEL}>Description</th>
              {orderedTools.map((tool) => (
                <td key={tool.slug} className={`${CELL} text-sm text-secondary leading-relaxed`}>
                  {tool.description}
                </td>
              ))}
            </tr>
            <tr>
              <th className={ROW_LABEL}>Category</th>
              {orderedTools.map((tool) => (
                <td key={tool.slug} className={CELL}>
                  <span className="pill-filled">{tool.category}</span>
                </td>
              ))}
            </tr>
            <tr>
              <th className={ROW_LABEL}>Price</th>
              {orderedTools.map((tool) => (
                <td key={tool.slug} className={CELL}>
                  <span className="pill-outline">{priceLabelFor(tool)}</span>
                </td>
              ))}
            </tr>
            <tr>
              <th className={ROW_LABEL}>Tags</th>
              {orderedTools.map((tool) => (
                <td key={tool.slug} className={CELL}>
                  {(tool.tags?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span key={tag} className="pill-filled">{tag}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th className={ROW_LABEL}>Relevant in</th>
              {orderedTools.map((tool) => (
                <td key={tool.slug} className={CELL}>
                  {(tool.region_relevance?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tool.region_relevance.map((r) => (
                        <span key={r} className="pill-outline">{r}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th className="text-left align-top px-4 py-3 text-sm sm:text-xs font-semibold text-muted uppercase tracking-wide">
                Verified
              </th>
              {orderedTools.map((tool) => (
                <td key={tool.slug} className="align-top px-4 py-3">
                  {tool.verified ? (
                    <span className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-sm sm:text-xs font-semibold text-cream w-fit">
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
