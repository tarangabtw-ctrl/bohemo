'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { EMAIL_REGEX } from '@/lib/validateSubmission'
import { useSavedStories, useSavedTools } from '@/lib/savedAndCompare'
import { Button } from '../Button'
import { Icon } from '../Icon'

type Status = 'idle' | 'invalid' | 'not-live'

function emailProblem(value: string): string | null {
  const s = value.trim()
  if (!s) return 'Add your email.'
  if (!s.includes('@')) return 'Add the @ and the rest of your email, like you@company.com.'
  if (!/@[^@\s]+\.[^@\s]+$/.test(s)) return 'Add the end of your email, like .com or .in.'
  if (!EMAIL_REGEX.test(s) || s.length > 254) return 'Check the email address. It should look like name@company.com.'
  return null
}

/**
 * Sign in or sign up: one screen, email link or Google, no passwords.
 * UI only for now. Accounts aren't wired up, so sending says so plainly
 * instead of pretending an email went out.
 */
export function SignInView() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [fromSaves, setFromSaves] = useState(false)
  const { saved: tools } = useSavedTools()
  const { saved: stories } = useSavedStories()
  const inputRef = useRef<HTMLInputElement>(null)
  const noticeRef = useRef<HTMLDivElement>(null)
  const errorId = useId()
  const saves = tools.length + stories.length

  useEffect(() => {
    setFromSaves(new URLSearchParams(window.location.search).get('from') === 'saves')
  }, [])

  useEffect(() => {
    if (status === 'not-live') noticeRef.current?.focus()
  }, [status])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const problem = emailProblem(inputRef.current?.value ?? '')
    if (problem) {
      setError(problem)
      setStatus('invalid')
      inputRef.current?.focus()
      return
    }
    setError(null)
    setStatus('not-live')
  }

  return (
    <div className="grid justify-items-center px-4 pb-10 pt-6 md:pb-20 md:pt-[72px]">
      <section
        aria-labelledby="signin-title"
        className="grid w-full max-w-[480px] gap-4 rounded-lg border-hairline border-ink-900 bg-surface-raised px-5 pb-6 pt-7 md:px-10 md:pb-8 md:pt-10"
      >
        {fromSaves && saves > 0 && (
          <p className="flex items-center gap-2 justify-self-start rounded-pill bg-cream-300 px-3 py-1.5 text-sm font-semibold">
            <Icon name="bookmark" size={16} />
            Sign in to keep your {saves} {saves === 1 ? 'save' : 'saves'} on every device.
          </p>
        )}
        <h1 id="signin-title" className="text-balance font-display text-display-m font-extrabold text-text-strong">
          Sign in or sign up
        </h1>
        <p className="text-pretty text-[16.5px] leading-normal text-ink-700">
          No password. We email you a link. New here? The same link creates your account.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-1 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Email</span>
            <input
              ref={inputRef}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={status === 'invalid' || undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={() => {
                if (status !== 'idle') setStatus('idle')
                setError(null)
              }}
              className={`min-h-hit-min w-full rounded-md border-thin bg-surface-overlay px-4 font-body text-base text-text-strong outline-none placeholder:text-ink-600 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
                status === 'invalid' ? 'border-negative' : 'border-border-strong'
              }`}
            />
            {error && (
              <small id={errorId} className="flex items-center gap-1.5 text-[13.5px] font-medium text-negative">
                <Icon name="circle-alert" size={15} className="shrink-0" />
                {error}
              </small>
            )}
          </label>
          <Button type="submit" size="lg" block>
            Email me a link
          </Button>
        </form>

        <div className="flex items-center gap-3 font-mono text-xs text-ink-700 before:h-px before:flex-1 before:bg-border-hairline after:h-px after:flex-1 after:bg-border-hairline" aria-hidden="true">
          or
        </div>
        <Button variant="secondary" size="lg" block onClick={() => setStatus('not-live')}>
          Continue with Google
        </Button>

        {status === 'not-live' && (
          <div
            ref={noticeRef}
            tabIndex={-1}
            role="status"
            className="grid gap-1 rounded-md border-hairline border-border-strong bg-surface-page p-4 outline-none"
          >
            <p className="flex items-start gap-2 font-semibold text-text-strong">
              <Icon name="info" size={18} className="mt-0.5 shrink-0" />
              Sign-in isn&apos;t switched on yet.
            </p>
            <p className="text-body-sm text-ink-700">
              We&apos;re still building accounts, so no email was sent. Your saves are safe in this browser until then.
            </p>
          </div>
        )}

        <p className="text-pretty text-center text-[13px] leading-normal text-ink-700">
          By continuing you agree to the [TERMS] and [PRIVACY POLICY]. Free accounts keep up to 20 saves.
        </p>
      </section>
    </div>
  )
}
