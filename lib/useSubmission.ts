'use client'

import { useState } from 'react'
import { submitForm } from '@/lib/submit'
import { validateSubmission, type FieldErrors } from '@/lib/validateSubmission'
import { HONEYPOT_FIELD } from '@/lib/forms'
import type { SubmissionType } from '@/types'

export type FormStatus = 'idle' | 'sending' | 'sent' | 'error' | 'invalid'

interface SendArgs {
  type: SubmissionType
  email: string
  payload: Record<string, unknown>
}

/** Moves focus to the first field (in page order) that has an error. */
function focusFirstError(form: HTMLFormElement, errors: FieldErrors) {
  const targets = Array.from(form.querySelectorAll<HTMLElement>('[data-field]'))
  const first = targets.find((el) => el.dataset.field && errors[el.dataset.field])
  first?.focus()
}

/**
 * Shared send logic for the /api/submit forms: validate in the browser with the
 * same rules the API uses, then post through lib/submit.ts.
 */
export function useSubmission() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})

  async function send(form: HTMLFormElement, { type, email, payload }: SendArgs): Promise<boolean> {
    const checked = validateSubmission({ type, email, payload })
    if (Object.keys(checked.errors).length > 0) {
      setErrors(checked.errors)
      setStatus('invalid')
      focusFirstError(form, checked.errors)
      return false
    }
    setErrors({})
    setStatus('sending')
    const honeypot = String(new FormData(form).get(HONEYPOT_FIELD) ?? '')
    const result = await submitForm({ type, email: checked.email || undefined, payload: checked.payload, honeypot })
    setStatus(result === 'success' ? 'sent' : result)
    return result === 'success'
  }

  function reset() {
    setErrors({})
    setStatus('idle')
  }

  return { status, errors, send, reset }
}

/** Reads a text value from FormData, trimmed. */
export function readText(data: FormData, key: string): string {
  return String(data.get(key) ?? '').trim()
}
