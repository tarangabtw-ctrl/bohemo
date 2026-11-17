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
  /** Legacy column. Never read for the Bohemo Verified badge — use verified_at instead. */
  verified: boolean
  created_at: string
  // Local Fit fields. NULL/undefined = not checked yet. false or [] = checked and fails.
  languages: string[] | null
  payment_methods: string[] | null
  local_pricing: Record<string, unknown> | null
  low_bandwidth: boolean | null
  data_regions: string[] | null
  made_in_asia: boolean | null
  last_checked: string | null
  /** Bohemo Verified badge shows only when this is set. */
  verified_at: string | null
}

export interface Subscriber {
  id: string
  email: string
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
  why_it_matters: string | null
  edition_date: string | null
  edition_rank: number | null
  tools_mentioned: string[]
}

export type SubmissionType = 'tool_submission' | 'contact' | 'agency' | 'report_mistake' | 'invoice_request' | 'pro_waitlist'

export const SUBMISSION_TYPES: SubmissionType[] = [
  'tool_submission',
  'contact',
  'agency',
  'report_mistake',
  'invoice_request',
  'pro_waitlist',
]

export type ToolCategory = 'Writing' | 'Code' | 'Design' | 'Video' | 'Research' | 'Productivity' | 'Marketing'
export type PriceType = 'free' | 'freemium' | 'paid' | 'open-source'

export const TOOL_CATEGORIES: ToolCategory[] = ['Writing', 'Code', 'Design', 'Video', 'Research', 'Productivity', 'Marketing']
export const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'open-source', label: 'Open Source' },
]
