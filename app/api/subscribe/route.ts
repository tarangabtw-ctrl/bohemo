import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Subscriber } from '@/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Kit settings, from server-only env vars.
 * CONVERTKIT_API_KEY: the v3 API key (Kit → Settings → Developer). Not the API secret.
 * CONVERTKIT_FORM_ID: the form's number, from its URL in Kit (…/forms/1234567/…).
 */
function kitConfig(): { apiKey: string; formId: string } | null {
  const apiKey = process.env.CONVERTKIT_API_KEY?.trim()
  const formId = process.env.CONVERTKIT_FORM_ID?.trim()
  if (!apiKey || !formId || !/^\d+$/.test(formId)) return null
  return { apiKey, formId }
}

async function addToKit(email: string, config: { apiKey: string; formId: string }): Promise<boolean> {
  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${encodeURIComponent(config.formId)}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.apiKey, email }),
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const rawEmail = (body as { email?: unknown } | null)?.email
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : ''

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const config = kitConfig()
  if (!config) {
    // Shows in the Vercel function logs. Never logs the values themselves.
    console.error('[subscribe] Kit is not configured: CONVERTKIT_API_KEY must be set and CONVERTKIT_FORM_ID must be the numeric form ID.')
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  // Kit first. Kit sends The Signal, so if it fails we stop here and write nothing:
  // the reader can try again without being told they're "already subscribed".
  if (!(await addToKit(email, config))) {
    console.error('[subscribe] Kit rejected the signup (check the API key and form ID).')
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  // Our own copy of the list. Kit already has them, so a failure here doesn't fail the signup.
  if (supabase) {
    const row: Pick<Subscriber, 'email'> = { email }
    const { error } = await supabase.from('subscribers').insert(row)
    if (error?.code === '23505') {
      return NextResponse.json({ status: 'duplicate' })
    }
    if (error) {
      console.error('[subscribe] Saved in Kit, but the Supabase insert failed:', error.code)
    }
  }

  return NextResponse.json({ status: 'success' })
}
