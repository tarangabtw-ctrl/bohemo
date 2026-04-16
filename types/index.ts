export interface Tool {
  id: string
  name: string
  slug: string
  description: string
  url: string
  category: ToolCategory
  price_type: PriceType
  price_label: string | null
  tags: string[]
  region_relevance: string[]
  verified: boolean
  created_at: string
}

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  url: string
  source: string
  category: string
  region: string
  published_at: string
  created_at: string
}

export type ToolCategory = 'Writing' | 'Code' | 'Design' | 'Video' | 'Research' | 'Productivity' | 'Marketing'
export type PriceType = 'free' | 'freemium' | 'paid' | 'open-source'

export const TOOL_CATEGORIES: ToolCategory[] = ['Writing', 'Code', 'Design', 'Video', 'Research', 'Productivity', 'Marketing']
export const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'open-source', label: 'Open Source' },
]
