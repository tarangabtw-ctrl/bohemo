import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateSubmission } from '@/lib/validateSubmission'
import { SUBMISSION_TYPES, type SubmissionType } from '@/types'

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

  const rawPayload =
    body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {}
  const payloadSize = new TextEncoder().encode(JSON.stringify(rawPayload)).length
  if (payloadSize > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
  }

  // Same rules the forms run in the browser (lib/validateSubmission.ts).
  const { errors, email, payload } = validateSubmission({
    type: type as SubmissionType,
    email: body.email,
    payload: rawPayload,
  })
  const invalidFields = Object.keys(errors)
  if (invalidFields.length > 0) {
    return NextResponse.json({ error: 'invalid_fields', fields: invalidFields }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  // anon has INSERT only on submissions (no SELECT) — never chain .select() here.
  const { error } = await supabase.from('submissions').insert({
    type,
    email: email || null,
    payload,
  })

  if (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ status: 'success' })
}
