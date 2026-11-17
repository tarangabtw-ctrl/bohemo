import { Button } from './Button'

interface EmptyStateProps {
  kind?: 'empty' | 'error' | 'notfound' | 'offline'
  title?: string
  body?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

const COPY: Record<string, { title: string; body: string; action?: string }> = {
  empty: { title: 'Nothing here yet.', body: "We'd rather show you nothing than show you junk." },
  error: { title: 'That broke.', body: 'Our fault, not yours. Try again.', action: 'Try again' },
  notfound: { title: 'Lost in translation.', body: "Which is exactly what we're here to fix." },
  offline: { title: "You're offline.", body: 'Check your connection and try again.', action: 'Try again' },
}

export function EmptyState({ kind = 'empty', title, body, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const c = COPY[kind]
  const label = actionLabel ?? c.action
  return (
    <div className="mx-auto flex max-w-[440px] flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="mb-2 grid w-[120px] gap-2" aria-hidden="true">
        <div className="flex gap-2">
          <span className="h-[22px] flex-1 rounded-pill border-thick border-dashed border-border-strong" />
          <span className="h-[22px] w-[22px] shrink-0 rounded-full border-thick border-dashed border-border-strong" />
        </div>
        <div className="flex gap-2">
          <span className="h-[22px] flex-1 rounded-pill border-thick border-dashed border-border-strong" />
        </div>
        <div className="flex gap-2">
          <span className="h-[22px] w-[22px] shrink-0 rounded-full border-thick border-dashed border-border-strong" />
          <span className="h-[22px] flex-1 rounded-pill border-thick border-dashed border-border-strong" />
        </div>
      </div>
      {kind === 'notfound' && <span className="font-mono text-label font-medium uppercase text-text-muted">404</span>}
      <h2 className="font-display text-[22px] font-bold tracking-title text-text-strong">{title || c.title}</h2>
      <p className="text-[15.5px] text-text-muted">{body || c.body}</p>
      {label && (actionHref ? <Button variant="secondary" href={actionHref}>{label}</Button> : <Button variant="secondary" onClick={onAction}>{label}</Button>)}
    </div>
  )
}
