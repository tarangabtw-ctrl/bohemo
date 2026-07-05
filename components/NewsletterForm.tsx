'use client'

import { useState } from 'react'

type PostHogWindow = Window & {
  posthog?: { capture: (event: string, props?: Record<string, unknown>) => void }
}

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [subBtn, setSubBtn] = useState('Subscribe')
  const [subMsg, setSubMsg] = useState('No spam. No AI-generated fluff. Unsubscribe anytime. bohemo.')
  const [subDisabled, setSubDisabled] = useState(false)

  async function handleSubscribe() {
    if (!email || !email.includes('@')) {
      setSubMsg('Please enter a valid email.')
      return
    }

    setSubBtn('Subscribing...')
    setSubDisabled(true)

    try {
      const kitFormId = process.env.NEXT_PUBLIC_KIT_FORM_ID
      const res = await fetch(`https://api.convertkit.com/v3/forms/${kitFormId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.NEXT_PUBLIC_KIT_API_KEY,
          email,
          first_name: '',
        }),
      })

      if (res.ok) {
        setSubBtn('✓ Subscribed')
        setSubMsg("You're in. First issue coming soon.")
        setEmail('')
        ;(window as PostHogWindow).posthog?.capture('newsletter_signup', { email })
      } else {
        throw new Error()
      }
    } catch {
      setSubBtn('Subscribe')
      setSubDisabled(false)
      setSubMsg('Something went wrong. Try again.')
    }
  }

  return (
    <div className="newsletter-form">
      <div className="newsletter-input-row">
        <input
          type="email"
          className="newsletter-input"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
        />
        <button
          className="btn-primary"
          type="button"
          onClick={handleSubscribe}
          disabled={subDisabled}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {subBtn}
        </button>
      </div>
      <p className="newsletter-fine">{subMsg}</p>
    </div>
  )
}
