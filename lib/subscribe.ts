// Client-side newsletter signup. Posts to /api/subscribe (Supabase + Kit).
import { track } from '@/lib/analytics'

export type SubscribeStatus = 'success' | 'duplicate' | 'error' | 'invalid'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function subscribe(email: string): Promise<SubscribeStatus> {
  if (!EMAIL_REGEX.test(email)) return 'invalid'
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data: { status?: string } = await res.json().catch(() => ({}))
    const status: SubscribeStatus =
      res.ok && data.status === 'duplicate' ? 'duplicate' : res.ok && data.status === 'success' ? 'success' : 'error'
    track('newsletter_signup', { status })
    return status
  } catch {
    track('newsletter_signup', { status: 'error' })
    return 'error'
  }
}
