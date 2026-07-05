import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const rawEmail = (body as { email?: unknown } | null)?.email
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : ''

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  let convertKitFailed = false
  try {
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: process.env.CONVERTKIT_API_KEY, email }),
      },
    )
    if (!res.ok) convertKitFailed = true
  } catch {
    convertKitFailed = true
  }

  if (!supabase) {
    return convertKitFailed
      ? NextResponse.json({ error: 'server_error' }, { status: 500 })
      : NextResponse.json({ status: 'success' })
  }

  const { error } = await supabase.from('subscribers').insert({ email })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ status: 'duplicate' })
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  if (convertKitFailed) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ status: 'success' })
}
