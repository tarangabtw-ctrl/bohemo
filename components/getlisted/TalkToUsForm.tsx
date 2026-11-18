'use client'

import { useEffect, useRef, useState } from 'react'
import { CONTACT_TOPICS } from '@/lib/forms'
import { readText, useSubmission } from '@/lib/useSubmission'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { FormAlert, Honeypot, SelectField, TextField } from '../forms/Fields'

/** "Talk to us" at /get-listed#talk. Topic Agency sends type `agency`, every other topic type `contact`. */
export function TalkToUsForm() {
  const { status, errors, send } = useSubmission()
  // ?topic=agency (the footer's and Pricing's "Talk to Bohemo Agency") preselects Agency.
  const [initialTopic, setInitialTopic] = useState('')
  const [sentTo, setSentTo] = useState('')
  const sectionRef = useRef<HTMLElement>(null)
  const sentRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get('topic')
    if (topic && CONTACT_TOPICS.some((t) => t.value === topic)) {
      setInitialTopic(topic)
      if (window.location.hash !== '#talk') sectionRef.current?.scrollIntoView()
    }
  }, [])

  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus()
  }, [status])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const topic = readText(data, 'topic')
    const email = readText(data, 'email')
    const ok = await send(e.currentTarget, {
      type: topic === 'agency' ? 'agency' : 'contact',
      email,
      payload: {
        name: readText(data, 'name'),
        topic,
        message: readText(data, 'message'),
      },
    })
    if (ok) setSentTo(email)
  }

  return (
    <section
      ref={sectionRef}
      id="talk"
      aria-labelledby="talk-heading"
      className="mt-10 grid max-w-[760px] scroll-mt-24 gap-5 rounded-lg border-hairline border-border-hairline bg-surface-raised px-5 py-6 md:mt-[72px] md:px-10 md:py-9"
    >
      <div>
        <p className="font-mono text-label font-medium uppercase text-text-muted">Talk to us</p>
        <h2 id="talk-heading" className="mt-1.5 font-display text-title-1 font-bold text-text-strong">
          A question before you submit?
        </h2>
        <p className="mt-1 text-pretty text-[15px] leading-normal text-ink-700">
          Ask about Featured placement, Bohemo Verified, Bohemo Agency or anything else. A person replies.
        </p>
      </div>

      {status === 'sent' ? (
        <p ref={sentRef} tabIndex={-1} role="status" className="flex items-start gap-2 font-semibold text-positive outline-none">
          <Icon name="circle-check" size={20} className="mt-0.5 shrink-0" />
          Sent. A person reads every message, and we&apos;ll reply to {sentTo}.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-label="Talk to us" className="relative grid gap-x-5 gap-y-4 md:grid-cols-2">
          <TextField name="name" label="Your name" autoComplete="name" required error={errors.name} />
          <TextField name="email" type="email" label="Work email" autoComplete="email" required error={errors.email} />
          <SelectField
            key={initialTopic}
            name="topic"
            label="What is it about?"
            placeholder="Choose one"
            groups={[{ options: CONTACT_TOPICS }]}
            defaultValue={initialTopic}
            required
            error={errors.topic}
            className="md:col-span-2"
          />
          <TextField name="message" multiline label="Message" required error={errors.message} className="md:col-span-2" />
          <Honeypot />
          <FormAlert status={status} hasFieldErrors={Object.keys(errors).length > 0} className="md:col-span-2" />
          <div className="grid items-center gap-x-5 gap-y-3 md:col-span-2 md:flex md:flex-wrap">
            <Button type="submit" variant="secondary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </Button>
            <p className="text-center text-sm text-ink-700 md:text-left">We reply within [REPLY TIME].</p>
          </div>
        </form>
      )}
    </section>
  )
}
