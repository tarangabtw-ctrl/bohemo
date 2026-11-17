// Data layer. Every page reads Supabase through these functions.
// When Supabase is not configured or a query fails, the directory and news
// fall back to the seed data in lib/data.ts so no page breaks.
import { supabase } from '@/lib/supabase'
import { SEED_TOOLS, SEED_NEWS } from '@/lib/data'
import type { Tool, NewsArticle } from '@/types'

export type NewsHeadline = Pick<NewsArticle, 'id' | 'title' | 'source' | 'published_at' | 'url'>

// ── Tools ────────────────────────────────────────────────────────────────────

export async function getToolOfWeek(): Promise<Tool | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    if (error || !data || data.length === 0) return null
    return data[0] as Tool
  } catch {
    return null
  }
}

/** Most recently added tools, for Home's "Trending" row. */
export async function getTrendingTools(limit = 6): Promise<Tool[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.from('tools').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error || !data) return []
    return data as Tool[]
  } catch {
    return []
  }
}

export async function getTools(category?: string, price?: string): Promise<Tool[]> {
  if (supabase) {
    try {
      let query = supabase.from('tools').select('*').order('created_at', { ascending: false })
      if (category) query = query.eq('category', category)
      if (price) query = query.eq('price_type', price)
      const { data, error } = await query
      if (!error && data) return data as Tool[]
    } catch {
      // fall through to seed data
    }
  }
  let tools = SEED_TOOLS
  if (category) tools = tools.filter((t) => t.category === category)
  if (price) tools = tools.filter((t) => t.price_type === price)
  return tools
}

export async function getTool(slug: string): Promise<Tool | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tools').select('*').eq('slug', slug).single()
      if (!error && data) return data as Tool
    } catch {
      // fall through to seed data
    }
  }
  return SEED_TOOLS.find((t) => t.slug === slug) ?? null
}

export async function getSimilarTools(category: string, slug: string): Promise<Tool[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('category', category)
        .neq('slug', slug)
        .limit(3)
      if (!error && data) return data as Tool[]
    } catch {
      // fall through to seed data
    }
  }
  return SEED_TOOLS.filter((t) => t.category === category && t.slug !== slug).slice(0, 3)
}

/** Returns tools in the order the slugs were given (max 3). */
export async function getToolsBySlug(slugs: string[]): Promise<Tool[]> {
  if (slugs.length === 0) return []
  let tools: Tool[] = SEED_TOOLS.filter((t) => slugs.includes(t.slug))
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tools').select('*').in('slug', slugs)
      if (!error && data) tools = data as Tool[]
    } catch {
      // keep seed data
    }
  }
  return slugs.map((s) => tools.find((t) => t.slug === s)).filter((t): t is Tool => Boolean(t))
}

// ── News ─────────────────────────────────────────────────────────────────────

export async function getLatestNews(limit = 3): Promise<NewsHeadline[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, source, published_at, url')
      .order('published_at', { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return data as NewsHeadline[]
  } catch {
    return []
  }
}

export async function getNews(region?: string): Promise<NewsArticle[]> {
  if (supabase) {
    try {
      let query = supabase.from('news').select('*').order('published_at', { ascending: false })
      if (region) query = query.eq('region', region)
      const { data, error } = await query
      if (!error && data) return data as NewsArticle[]
    } catch {
      // fall through to seed data
    }
  }
  let news = [...SEED_NEWS].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )
  if (region) news = news.filter((n) => n.region === region)
  return news
}

export async function getArticle(id: string): Promise<NewsArticle | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
      if (!error && data) return data as NewsArticle
    } catch {
      // fall through to seed data
    }
  }
  return SEED_NEWS.find((n) => n.id === id) ?? null
}

export async function getRelatedArticles(region: string, id: string): Promise<NewsArticle[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('region', region)
        .neq('id', id)
        .limit(3)
      if (!error && data) return data as NewsArticle[]
    } catch {
      // fall through to seed data
    }
  }
  return SEED_NEWS.filter((n) => n.region === region && n.id !== id).slice(0, 3)
}

// ── Editions (The Signal) ────────────────────────────────────────────────────
// An edition is a set of up to 7 stories sharing an edition_date, ordered by
// edition_rank. Stories without an edition_date never appear here.

/** Most recent edition_date that has at least one story. */
export async function getLatestEditionDate(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('news')
      .select('edition_date')
      .not('edition_date', 'is', null)
      .order('edition_date', { ascending: false })
      .limit(1)
    if (error || !data || data.length === 0) return null
    return (data[0] as { edition_date: string }).edition_date
  } catch {
    return null
  }
}

/** Stories for one edition date, ordered by rank (1–7). */
export async function getEditionStories(date: string): Promise<NewsArticle[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('edition_date', date)
      .order('edition_rank', { ascending: true })
    if (error || !data) return []
    return data as NewsArticle[]
  } catch {
    return []
  }
}

/** Past edition dates, most recent first — for the archive. */
export async function getEditionDates(): Promise<string[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('news')
      .select('edition_date')
      .not('edition_date', 'is', null)
      .order('edition_date', { ascending: false })
    if (error || !data) return []
    const dates = (data as { edition_date: string }[]).map((r) => r.edition_date)
    return Array.from(new Set(dates))
  } catch {
    return []
  }
}
