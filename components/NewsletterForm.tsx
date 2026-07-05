'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  variant?: 'default'
  className?: string
}

export function NewsletterForm({ className }: Props = {}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit() {
    if (!EMAIL_REGEX.test(email)) {
      setValidationError('Please enter a valid email.')
      return
    }
    setValidationError('')
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data.status === 'duplicate') {
        setStatus('duplicate')
      } else if (res.ok && data.status === 'success') {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const wrapperClass = className ? `newsletter-form ${className}` : 'newsletter-form'

  if (status === 'success') {
    return (
      <div className={wrapperClass}>
        <p className="newsletter-fine">You&apos;re in! Watch your inbox for the next issue.</p>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <div className="newsletter-input-row">
        <input
          type="email"
          className="newsletter-input"
          placeholder="your@email.com"
          value={email}
          disabled={status === 'loading'}
          onChange={(e) => {
            setEmail(e.target.value)
            setValidationError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          className="btn-primary"
          type="button"
          onClick={handleSubmit}
          disabled={status === 'loading'}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      <p className="newsletter-fine">
        {validationError ||
          (status === 'duplicate' && "You're already on the list.") ||
          (status === 'error' && 'Something went wrong — try again.') ||
          'No spam. No AI-generated fluff. Unsubscribe anytime. bohemo.'}
      </p>
    </div>
  )
}
