import { track } from '@/lib/analytics'
import type { SubmissionType } from '@/types'

export type SubmitStatus = 'success' | 'error' | 'invalid'

interface SubmitArgs {
  type: SubmissionType
  payload: Record<string, unknown>
  email?: string
}

/** Posts to /api/submit. Include a `company` field in your form as a hidden honeypot. */
export async function submitForm({ type, payload, email }: SubmitArgs): Promise<SubmitStatus> {
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, email }),
    })
    const status: SubmitStatus = res.ok ? 'success' : res.status === 400 ? 'invalid' : 'error'
    track('form_submitted', { type, status })
    return status
  } catch {
    track('form_submitted', { type, status: 'error' })
    return 'error'
  }
}
