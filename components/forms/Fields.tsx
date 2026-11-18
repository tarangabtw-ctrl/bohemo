'use client'

import { Fragment, useId, useState } from 'react'
import { HONEYPOT_FIELD } from '@/lib/forms'
import type { FormStatus } from '@/lib/useSubmission'
import { FilterChip } from '../FilterChip'
import { Icon } from '../Icon'

// Form building blocks for the /api/submit forms (Pricing, Get listed).
// Every focusable control carries data-field={name} so useSubmission can move
// focus to the first field with an error.

// 16px text so iOS doesn't zoom in when a field gets focus.
const FIELD =
  'w-full min-w-0 rounded-md border-thin border-border-strong bg-surface-overlay px-4 font-body text-body text-text-strong outline-none placeholder:text-ink-600 aria-[invalid=true]:border-negative focus-visible:border-ink-900 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2'
const LABEL = 'text-sm font-semibold text-text-strong'
const HINT = 'text-[13px] leading-snug text-text-muted'

interface FieldBase {
  name: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
}

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return ids || undefined
}

function Notes({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <small id={`${id}-hint`} className={HINT}>
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="flex items-start gap-1.5 text-[13px] font-medium leading-snug text-negative">
          <Icon name="circle-alert" size={15} className="mt-px shrink-0" />
          {error}
        </small>
      )}
    </>
  )
}

interface TextFieldProps extends FieldBase {
  type?: 'text' | 'email' | 'url'
  multiline?: boolean
  placeholder?: string
  autoComplete?: string
  defaultValue?: string
  maxLength?: number
}

export function TextField({
  name,
  label,
  hint,
  error,
  required,
  className = '',
  type = 'text',
  multiline,
  placeholder,
  autoComplete,
  defaultValue,
  maxLength,
}: TextFieldProps) {
  const id = useId()
  const common = {
    id,
    name,
    'data-field': name,
    placeholder,
    autoComplete,
    defaultValue,
    maxLength,
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(id, hint, error),
  }
  return (
    <div className={`grid content-start gap-1.5 ${className}`}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {multiline ? (
        <textarea {...common} className={`${FIELD} min-h-28 resize-y py-3 leading-normal`} />
      ) : (
        <input
          {...common}
          type={type}
          inputMode={type === 'email' ? 'email' : type === 'url' ? 'url' : undefined}
          spellCheck={type === 'text' ? undefined : false}
          className={`${FIELD} h-12`}
        />
      )}
      <Notes id={id} hint={hint} error={error} />
    </div>
  )
}

interface SelectFieldProps extends FieldBase {
  placeholder: string
  groups: { label?: string; options: { value: string; label: string }[] }[]
  defaultValue?: string
}

export function SelectField({ name, label, hint, error, required, className = '', placeholder, groups, defaultValue = '' }: SelectFieldProps) {
  const id = useId()
  const options = (opts: { value: string; label: string }[]) =>
    opts.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))
  return (
    <div className={`grid content-start gap-1.5 ${className}`}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <span className="relative block">
        <select
          id={id}
          name={name}
          data-field={name}
          defaultValue={defaultValue}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={`${FIELD} h-12 cursor-pointer appearance-none pr-11`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {groups.map((g, i) =>
            g.label ? (
              <optgroup key={g.label} label={g.label}>
                {options(g.options)}
              </optgroup>
            ) : (
              <Fragment key={i}>{options(g.options)}</Fragment>
            )
          )}
        </select>
        <Icon name="chevron-down" size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-700" />
      </span>
      <Notes id={id} hint={hint} error={error} />
    </div>
  )
}

interface ChipGroupProps extends FieldBase {
  options: { value: string; label: string }[]
  /** One choice only (pressing another chip moves the selection). */
  single?: boolean
  defaultValue?: string[]
  onChange?: (values: string[]) => void
}

/** Pill chips that post their values as hidden inputs (read with FormData.getAll). */
export function ChipGroup({ name, label, hint, error, className = '', options, single, defaultValue = [], onChange }: ChipGroupProps) {
  const id = useId()
  const [selected, setSelected] = useState<string[]>(defaultValue)

  function toggle(value: string) {
    const next = single ? [value] : selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    setSelected(next)
    onChange?.(next)
  }

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={describedBy(id, hint, error)}
      data-field={name}
      tabIndex={-1}
      className={`grid content-start gap-2 rounded-sm outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-4 ${className}`}
    >
      <span id={`${id}-label`} className={LABEL}>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <FilterChip key={o.value} selected={selected.includes(o.value)} onClick={() => toggle(o.value)}>
            {o.label}
          </FilterChip>
        ))}
      </div>
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <Notes id={id} hint={hint} error={error} />
    </div>
  )
}

interface CheckboxFieldProps {
  name: string
  error?: string
  children: React.ReactNode
}

export function CheckboxField({ name, error, children }: CheckboxFieldProps) {
  const id = useId()
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="flex min-h-hit-min cursor-pointer items-start gap-3 py-2.5 text-[15px] leading-snug">
        <input
          id={id}
          type="checkbox"
          name={name}
          value="yes"
          data-field={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-ink-900 outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
        />
        <span>{children}</span>
      </label>
      <Notes id={id} error={error} />
    </div>
  )
}

/** Hidden anti-spam field. People never see or reach it; bots fill it in. */
export function Honeypot() {
  return (
    <input
      type="text"
      name={HONEYPOT_FIELD}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] h-px w-px opacity-0"
    />
  )
}

/** The form-level message for the invalid and error states. Renders nothing otherwise. */
interface FormAlertProps {
  status: FormStatus
  /** True when the browser check marked fields; false when the server turned the form down. */
  hasFieldErrors: boolean
  className?: string
}

export function FormAlert({ status, hasFieldErrors, className = '' }: FormAlertProps) {
  if (status !== 'invalid' && status !== 'error') return null
  const message =
    status === 'error'
      ? 'That didn’t send. Our fault, not yours. Try again.'
      : hasFieldErrors
        ? 'Some answers need fixing. They’re marked above.'
        : 'Something in the form didn’t pass our check. Look over your answers and try again.'
  return (
    <p role="alert" className={`flex items-start gap-2 text-sm font-medium text-negative ${className}`}>
      <Icon name="circle-alert" size={18} className="mt-0.5 shrink-0" />
      {message}
    </p>
  )
}
