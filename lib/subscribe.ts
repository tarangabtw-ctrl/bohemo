// Client-side newsletter signup. Posts to /api/subscribe (Supabase + Kit).
import { track } from '@/lib/analytics'

export type SubscribeStatus = 'success' | 'duplicate' | 'error' | 'invalid'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Where the form sits, for analytics. */
export type NewsletterSource = 'home' | 'article' | 'edition'

export async function subscribe(email: string, source: NewsletterSource): Promise<SubscribeStatus> {
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
    if (status === 'success') track('newsletter_subscribed', { source })
    return status
  } catch {
    track('newsletter_signup', { status: 'error' })
    return 'error'
  }
}
