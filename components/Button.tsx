import Link from 'next/link'
import { Icon } from './Icon'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  icon?: string
  iconRight?: string
  label?: string
  href?: string
  external?: boolean
  disabled?: boolean
  block?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  children?: React.ReactNode
  className?: string
  'aria-expanded'?: boolean
}

const VARIANT: Record<string, string> = {
  primary: 'bg-action-primary-bg text-action-primary-fg hover:bg-action-primary-bg-hover',
  secondary: 'bg-action-secondary-bg text-text-strong border-action-secondary-border hover:bg-cream-300',
  ghost: 'bg-transparent text-text-strong hover:bg-action-ghost-hover',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  label,
  href,
  external,
  disabled,
  block,
  type = 'button',
  onClick,
  children,
  className = '',
  'aria-expanded': ariaExpanded,
}: ButtonProps) {
  const iconOnly = !children && !!icon
  // Each case sets min-h/width/px/text together so no two classes ever target the same property.
  const sizing = iconOnly
    ? size === 'lg'
      ? 'min-h-[52px] w-[52px] px-0 text-base'
      : 'min-h-hit-min w-hit-min px-0 text-[15px]'
    : size === 'lg'
      ? 'min-h-[52px] px-7 text-base'
      : 'min-h-hit-min px-[22px] text-[15px]'
  const cls = [
    'inline-flex items-center justify-center gap-2 rounded-pill border-thin border-transparent font-body font-semibold',
    'whitespace-nowrap transition-[background-color,color,border-color] duration-fast ease-out active:translate-y-px',
    'disabled:bg-cream-300 disabled:text-ink-600 disabled:border-transparent disabled:cursor-not-allowed disabled:active:translate-y-0',
    'outline-none focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2',
    VARIANT[variant],
    sizing,
    block && !iconOnly ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const iconSize = size === 'lg' ? 20 : 18
  const inner = (
    <>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  )
  const ariaLabel = iconOnly ? label : undefined

  if (href && !disabled) {
    if (external) {
      return (
        <a className={cls} href={href} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {inner}
        </a>
      )
    }
    return (
      <Link className={cls} href={href} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </Link>
    )
  }
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      onClick={onClick}
    >
      {inner}
    </button>
  )
}
