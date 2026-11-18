// Pro prices, in rupees with GST included. Payments aren't live yet (see SPEC.md):
// until they are, every "Get Pro" opens the founding-member waitlist form.
export const PRO_PRICE = {
  monthly: '₹499',
  annual: '₹4,990',
  /** Annual price divided by 12, rounded down. */
  annualPerMonth: '₹416',
}

export const FOUNDING_PLACES = 500

/** Bohemo Verified review time (SPEC.md: replaces every [REVIEW TIME]). */
export const REVIEW_TIME = '10 working days'
