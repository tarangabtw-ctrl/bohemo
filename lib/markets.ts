export interface Market {
  id: string
  code: string
  name: string
  currency: string
  lang: string
}

// Canonical market list — matches SPEC.md and the home page data module.
// Philippines, Malaysia and Singapore are English-only (no local-language placeholder).
export const MARKETS: Market[] = [
  { id: 'in', code: 'IN', name: 'India', currency: '₹', lang: 'Hindi' },
  { id: 'id', code: 'ID', name: 'Indonesia', currency: 'Rp', lang: 'Bahasa' },
  { id: 'vn', code: 'VN', name: 'Vietnam', currency: '₫', lang: 'Vietnamese' },
  { id: 'ph', code: 'PH', name: 'Philippines', currency: '₱', lang: 'Filipino' },
  { id: 'th', code: 'TH', name: 'Thailand', currency: '฿', lang: 'Thai' },
  { id: 'my', code: 'MY', name: 'Malaysia', currency: 'RM', lang: 'Malay' },
  { id: 'sg', code: 'SG', name: 'Singapore', currency: 'S$', lang: 'English' },
]
