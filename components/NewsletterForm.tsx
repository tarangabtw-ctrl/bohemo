'use client'

import { useId, useState } from 'react'
import { subscribe, type NewsletterSource, type SubscribeStatus } from '@/lib/subscribe'
import { Icon } from './Icon'
import { Button } from './Button'

const MESSAGES: Record<SubscribeStatus, string> = {
  success: "You're in. The next edition of The Signal lands at 8:00 IST.",
  duplicate: "You're already on the list. The next edition lands at 8:00 IST.",
  error: "That broke. Our fault, not yours. Try again.",
  invalid: 'Check the email address. It should look like name@company.com.',
}

export function NewsletterForm({ source }: { source: NewsletterSource }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const inputId = useId()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(await subscribe(email, source))
    setLoading(false)
  }

  if (status === 'success') {
    return (
      <p className="flex items-center gap-2.5 font-semibold text-positive">
        <Icon name="circle-check" size={20} />
        {MESSAGES.success}
      </p>
    )
  }

  const isError = status === 'error' || status === 'invalid'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={inputId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={isError || undefined}
          required
          className={`h-[52px] min-w-[200px] flex-1 rounded-pill border-thick bg-surface-raised px-5 font-body text-base text-text-strong outline-none placeholder:text-ink-600 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
            isError ? 'border-negative' : 'border-border-strong'
          }`}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      {status && (
        <p role="status" className={`text-[13px] ${isError ? 'font-medium text-negative' : 'text-text-muted'}`}>
          {MESSAGES[status]}
        </p>
      )}
    </form>
  )
}
