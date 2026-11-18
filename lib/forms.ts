import { MARKETS } from '@/lib/markets'

// Fixed option lists shared by the forms and by the /api/submit validator.
// They are form choices, not directory data, so they live here and not in Supabase.

export const BILLING_PLANS = ['annual', 'monthly'] as const
export type BillingPlan = (typeof BILLING_PLANS)[number]

/** GST place of supply: Indian states, then union territories. */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export const UNION_TERRITORIES = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

/** "Talk to us" topics. Choosing `agency` sends the form with type `agency`, everything else with type `contact`. */
export const CONTACT_TOPICS = [
  { value: 'featured', label: 'Featured placement' },
  { value: 'verified', label: 'Bohemo Verified' },
  { value: 'listing', label: 'My existing listing' },
  { value: 'agency', label: 'Bohemo Agency' },
  { value: 'other', label: 'Something else' },
]

export const MARKET_IDS = MARKETS.map((m) => m.id)

/** Languages a submitted tool can work in: each market's language, plus English. */
export const LANGUAGE_OPTIONS = Array.from(new Set([...MARKETS.map((m) => m.lang), 'English']))

export const PAYMENT_OPTIONS = ['UPI', 'RuPay', 'Cards', 'Other']

export const FREE_PLAN_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

/**
 * Name of the hidden anti-spam input in the v2 forms. Its value is sent to
 * /api/submit as `company`. The input itself isn't called "company" because
 * browsers autofill that name, which would silently drop real submissions.
 */
export const HONEYPOT_FIELD = 'fax_only'
