import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS, SEED_NEWS } from '@/lib/data'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/tools`, lastModified: new Date() },
    { url: `${SITE_URL}/compare`, lastModified: new Date() },
    { url: `${SITE_URL}/news`, lastModified: new Date() },
    { url: `${SITE_URL}/news/archive`, lastModified: new Date() },
  ]

  let tools: { slug: string; created_at: string | null }[] = SEED_TOOLS.map((t) => ({
    slug: t.slug,
    created_at: t.created_at,
  }))
  let news: { id: string; published_at: string | null; edition_date: string | null }[] = SEED_NEWS.map((n) => ({
    id: n.id,
    published_at: n.published_at,
    edition_date: n.edition_date,
  }))

  if (supabase) {
    try {
      const [{ data: toolRows, error: toolError }, { data: newsRows, error: newsError }] = await Promise.all([
        supabase.from('tools').select('slug, created_at'),
        supabase.from('news').select('id, published_at, edition_date'),
      ])
      tools = !toolError && toolRows ? toolRows : []
      news = !newsError && newsRows ? newsRows : []
    } catch {
      // keep seed-derived routes so the sitemap matches what the pages render
    }
  }

  const toolRoutes: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${SITE_URL}/tools/${t.slug}`,
    lastModified: t.created_at ? new Date(t.created_at) : new Date(),
  }))

  const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/news/${n.id}`,
    lastModified: n.published_at ? new Date(n.published_at) : new Date(),
  }))

  // One page per edition (/news/archive/YYYY-MM-DD).
  const editionDates = Array.from(new Set(news.map((n) => n.edition_date).filter((d): d is string => Boolean(d))))
  const editionRoutes: MetadataRoute.Sitemap = editionDates.map((d) => ({
    url: `${SITE_URL}/news/archive/${d}`,
    lastModified: new Date(`${d}T00:00:00Z`),
  }))

  return [...staticRoutes, ...toolRoutes, ...newsRoutes, ...editionRoutes]
}
