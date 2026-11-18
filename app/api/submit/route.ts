import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SUBMISSION_TYPES, type SubmissionType } from '@/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_PAYLOAD_BYTES = 16 * 1024

interface SubmitBody {
  type?: unknown
  email?: unknown
  payload?: unknown
  /** Hidden honeypot field — real users never fill this in. */
  company?: unknown
}

export async function POST(request: Request) {
  let body: SubmitBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // Honeypot: silently pretend success so bots don't learn to avoid the field.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return NextResponse.json({ status: 'success' })
  }

  const type = typeof body.type === 'string' ? body.type : ''
  if (!SUBMISSION_TYPES.includes(type as SubmissionType)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 })
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim() : ''
  if (rawEmail && !EMAIL_REGEX.test(rawEmail)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const payload = body.payload && typeof body.payload === 'object' ? body.payload : {}
  const payloadSize = new TextEncoder().encode(JSON.stringify(payload)).length
  if (payloadSize > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
  }

  if (!supabase) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  // anon has INSERT only on submissions (no SELECT) — never chain .select() here.
  const { error } = await supabase.from('submissions').insert({
    type,
    email: rawEmail || null,
    payload,
  })

  if (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ status: 'success' })
}
