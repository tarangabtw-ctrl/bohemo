import { track } from '@/lib/analytics'
import type { SubmissionType } from '@/types'

export type SubmitStatus = 'success' | 'error' | 'invalid'

interface SubmitArgs {
  type: SubmissionType
  payload: Record<string, unknown>
  email?: string
  /** Value of the form's hidden `company` honeypot field. Real users leave it empty. */
  honeypot?: string
}

/** Posts to /api/submit. Render a hidden `company` input in your form and pass its value as `honeypot`. */
export async function submitForm({ type, payload, email, honeypot }: SubmitArgs): Promise<SubmitStatus> {
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, email, company: honeypot ?? '' }),
    })
    const status: SubmitStatus = res.ok ? 'success' : res.status === 400 ? 'invalid' : 'error'
    track('form_submitted', { type, status })
    return status
  } catch {
    track('form_submitted', { type, status: 'error' })
    return 'error'
  }
}
