import { PRICE_TYPES, type Tool } from '@/types'

export function formatRelativeTime(date: string): string {
  const then = new Date(date).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - then)

  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (hours < 1) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

/** "15 Nov 2026". Dates come from Supabase as ISO strings. */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

/** The tool's own price label, else the readable price type ("Freemium"). */
export function priceLabel(tool: Pick<Tool, 'price_label' | 'price_type'>): string {
  return tool.price_label ?? PRICE_TYPES.find((p) => p.value === tool.price_type)?.label ?? tool.price_type
}
