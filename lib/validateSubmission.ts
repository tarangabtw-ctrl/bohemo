import { TOOL_CATEGORIES, type SubmissionType } from '@/types'
import {
  BILLING_PLANS,
  CONTACT_TOPICS,
  FREE_PLAN_OPTIONS,
  INDIAN_STATES,
  LANGUAGE_OPTIONS,
  MARKET_IDS,
  PAYMENT_OPTIONS,
  UNION_TERRITORIES,
} from '@/lib/forms'

// One set of rules for every form that posts to /api/submit. The forms run it
// before sending (so people see what to fix), and the API route runs it again
// (so nothing skips it). Keys in FieldErrors are the payload keys, or "email".

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** 15 characters: state code, PAN, entity number, "Z", check character. */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export type FieldErrors = Record<string, string>

interface SubmissionInput {
  type: SubmissionType
  email: unknown
  payload: Record<string, unknown>
}

interface SubmissionResult {
  errors: FieldErrors
  /** Trimmed email, or '' when none was given. */
  email: string
  /** Only the known, cleaned fields. Types without rules pass their payload through unchanged. */
  payload: Record<string, unknown>
}

type RuleResult = { value?: unknown; error?: string }
type Rule = (value: unknown) => RuleResult

interface TypeRules {
  email: Rule
  payload: Record<string, Rule>
}

const asText = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.')
  } catch {
    return false
  }
}

function text(opts: { required?: string; max?: number } = {}): Rule {
  const max = opts.max ?? 200
  return (v) => {
    const s = asText(v)
    if (!s) return opts.required ? { error: opts.required } : {}
    if (s.length > max) return { error: `Keep this under ${max} characters.` }
    return { value: s }
  }
}

function link(opts: { required?: string } = {}): Rule {
  return (v) => {
    const s = asText(v)
    if (!s) return opts.required ? { error: opts.required } : {}
    if (s.length > 500 || !isHttpUrl(s)) return { error: 'Enter the full link, starting with https://' }
    return { value: s }
  }
}

function email(opts: { required?: string } = {}): Rule {
  return (v) => {
    const s = asText(v)
    if (!s) return opts.required ? { error: opts.required } : {}
    if (s.length > 254 || !EMAIL_REGEX.test(s)) return { error: 'Check the email address. It should look like name@company.com.' }
    return { value: s }
  }
}

function oneOf(options: readonly string[], opts: { required?: string } = {}): Rule {
  return (v) => {
    const s = asText(v)
    if (!s) return opts.required ? { error: opts.required } : {}
    if (!options.includes(s)) return { error: opts.required ?? 'Choose one of the options.' }
    return { value: s }
  }
}

function someOf(options: readonly string[]): Rule {
  return (v) => {
    if (v === undefined || v === null) return {}
    if (!Array.isArray(v) || !v.every((x) => typeof x === 'string' && options.includes(x))) {
      return { error: 'Choose from the options shown.' }
    }
    const picked = Array.from(new Set(v as string[]))
    return picked.length > 0 ? { value: picked } : {}
  }
}

function gstin(): Rule {
  return (v) => {
    const s = asText(v).toUpperCase().replace(/\s/g, '')
    if (!s) return {}
    if (!GSTIN_REGEX.test(s)) return { error: 'A GSTIN is 15 characters, like 27AAPFU0939F1ZV. Leave it blank if you are not GST-registered.' }
    return { value: s }
  }
}

function mustTick(message: string): Rule {
  return (v) => (v === true ? { value: true } : { error: message })
}

function flag(): Rule {
  return (v) => (v === true ? { value: true } : {})
}

const PLAN_RULE = oneOf(BILLING_PLANS, { required: 'Choose monthly or annual.' })
const MARKET_RULE = oneOf(MARKET_IDS)

const CONTACT_RULES: TypeRules = {
  email: email({ required: 'Add your work email so we can reply.' }),
  payload: {
    name: text({ required: 'Add your name.', max: 120 }),
    topic: oneOf(
      CONTACT_TOPICS.map((t) => t.value),
      { required: 'Choose what it is about.' }
    ),
    message: text({ required: 'Write your message.', max: 2000 }),
  },
}

const RULES: Partial<Record<SubmissionType, TypeRules>> = {
  pro_waitlist: {
    email: email({ required: 'Add your email so we can tell you when Pro opens.' }),
    payload: {
      plan: PLAN_RULE,
      company_name: text({ max: 200 }),
      gstin: gstin(),
      market: MARKET_RULE,
    },
  },
  invoice_request: {
    email: email({ required: 'Add the email the invoices should go to.' }),
    payload: {
      plan: PLAN_RULE,
      company_name: text({ required: 'Add the company name on your GST certificate.', max: 200 }),
      gstin: gstin(),
      billing_address: text({ required: 'Add the billing address, with the PIN code.', max: 500 }),
      state: oneOf([...INDIAN_STATES, ...UNION_TERRITORIES], { required: 'Choose your state or union territory.' }),
      finance_email: email(),
      market: MARKET_RULE,
    },
  },
  tool_submission: {
    email: email({ required: 'Add your work email. We send the review result there.' }),
    payload: {
      tool_name: text({ required: 'Add the tool’s name.', max: 120 }),
      website: link({ required: 'Add the tool’s website.' }),
      category: oneOf(TOOL_CATEGORIES, { required: 'Choose a category.' }),
      description: text({ required: 'Say what it does, in a line or two.', max: 1000 }),
      markets: someOf(MARKET_IDS),
      languages: someOf(LANGUAGE_OPTIONS),
      other_languages: text({ max: 200 }),
      free_plan: oneOf(FREE_PLAN_OPTIONS.map((o) => o.value)),
      lowest_price: text({ max: 120 }),
      pricing_page: link(),
      payment_methods: someOf(PAYMENT_OPTIONS),
      lightest_use: text({ max: 500 }),
      data_location: text({ max: 500 }),
      name: text({ required: 'Add your name.', max: 120 }),
      role: text({ max: 120 }),
      company_legal_name: text({ max: 200 }),
      speaks_for_company: mustTick('Tick this to confirm you can speak for the company.'),
      wants_featured: flag(),
      wants_verified: flag(),
    },
  },
  contact: CONTACT_RULES,
  agency: {
    ...CONTACT_RULES,
    payload: {
      ...CONTACT_RULES.payload,
      topic: oneOf(['agency'], { required: 'Choose what it is about.' }),
    },
  },
}

/** Pure function: safe to call in the browser and on the server. */
export function validateSubmission({ type, email: rawEmail, payload }: SubmissionInput): SubmissionResult {
  const rules = RULES[type]
  const errors: FieldErrors = {}

  if (!rules) {
    // No field rules for this type yet (report_mistake): keep the old behaviour,
    // where only the email format is checked and the payload is stored as sent.
    const result = email()(rawEmail)
    if (result.error) errors.email = result.error
    return { errors, email: typeof result.value === 'string' ? result.value : '', payload }
  }

  const emailResult = rules.email(rawEmail)
  if (emailResult.error) errors.email = emailResult.error

  const clean: Record<string, unknown> = {}
  for (const [key, rule] of Object.entries(rules.payload)) {
    const result = rule(payload[key])
    if (result.error) errors[key] = result.error
    else if (result.value !== undefined) clean[key] = result.value
  }

  return { errors, email: typeof emailResult.value === 'string' ? emailResult.value : '', payload: clean }
}
