import { Icon } from './Icon'

interface FilterChipProps {
  selected?: boolean
  count?: number
  icon?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function FilterChip({ selected = false, count, icon, onClick, children, className = '' }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-hit-min items-center gap-1.5 whitespace-nowrap rounded-pill border-thin px-4 font-body text-sm font-medium outline-none transition-colors duration-fast focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
        selected
          ? 'border-ink-900 bg-ink-900 text-cream-200'
          : 'border-border-strong bg-surface-raised text-text-strong hover:border-ink-900'
      } ${className}`}
    >
      {selected ? <Icon name="check" size={16} strokeWidth={2.25} /> : icon && <Icon name={icon} size={16} />}
      {children}
      {count != null && <span className={`font-mono text-xs ${selected ? 'text-sand-400' : 'text-text-muted'}`}>{count}</span>}
    </button>
  )
}
