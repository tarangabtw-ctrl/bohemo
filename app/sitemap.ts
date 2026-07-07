import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS, SEED_NEWS } from '@/lib/data'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/tools`, lastModified: new Date() },
    { url: `${SITE_URL}/news`, lastModified: new Date() },
  ]

  let tools: { slug: string; created_at: string | null }[] = SEED_TOOLS.map((t) => ({
    slug: t.slug,
    created_at: t.created_at,
  }))
  let news: { id: string; published_at: string | null }[] = SEED_NEWS.map((n) => ({
    id: n.id,
    published_at: n.published_at,
  }))

  if (supabase) {
    try {
      const [{ data: toolRows, error: toolError }, { data: newsRows, error: newsError }] = await Promise.all([
        supabase.from('tools').select('slug, created_at'),
        supabase.from('news').select('id, published_at'),
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

  return [...staticRoutes, ...toolRoutes, ...newsRoutes]
}
