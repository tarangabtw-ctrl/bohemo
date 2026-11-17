import { Icon } from './Icon'

interface TagProps {
  variant?: 'neutral' | 'brown' | 'outline' | 'ink' | 'positive' | 'warning' | 'info' | 'negative'
  size?: 'md' | 'sm'
  dot?: boolean
  icon?: string
  children: React.ReactNode
  className?: string
}

const VARIANT: Record<string, string> = {
  neutral: 'bg-fill-tag text-text-strong',
  brown: 'bg-fill-tag-brown text-text-strong',
  outline: 'bg-transparent border-thin border-border-strong text-text-strong',
  ink: 'bg-ink-900 text-cream-200',
  positive: 'bg-positive-soft text-positive',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  negative: 'bg-negative-soft text-negative',
}

export function Tag({ variant = 'neutral', size = 'md', dot, icon, children, className = '' }: TagProps) {
  const cls = [
    'inline-flex items-center gap-1 rounded-pill whitespace-nowrap font-body font-semibold',
    size === 'sm' ? 'h-[22px] px-2.5 text-xs' : 'h-[26px] px-3 text-[12.5px]',
    VARIANT[variant],
    className,
  ].join(' ')
  return (
    <span className={cls}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {icon && <Icon name={icon} size={13} strokeWidth={2} />}
      {children}
    </span>
  )
}
