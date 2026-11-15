'use client'

import { useState } from 'react'
import { subscribe, type SubscribeStatus } from '@/lib/subscribe'

// Unstyled placeholder: working signup logic, no design. Restyle in v2.
const MESSAGES: Record<SubscribeStatus, string> = {
  success: "You're in. Watch your inbox for the next issue.",
  duplicate: "You're already subscribed.",
  error: 'Something went wrong. Try again.',
  invalid: 'Please enter a valid email.',
}

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(await subscribe(email))
    setLoading(false)
  }

  if (status === 'success') return <p>{MESSAGES.success}</p>

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email">Email</label>{' '}
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />{' '}
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
      {status && <p role="status">{MESSAGES[status]}</p>}
    </form>
  )
}
