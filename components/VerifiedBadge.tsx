import { Icon } from './Icon'

interface VerifiedBadgeProps {
  variant?: 'solid' | 'outline'
  example?: boolean
}

// Shown only when a tool's verified_at is set — never tools.verified. See SPEC.md.
export function VerifiedBadge({ variant = 'solid', example = false }: VerifiedBadgeProps) {
  const label = example ? 'Example tool' : 'Verified'
  const title =
    'We checked the company’s own claims: real company, accurate prices, works as described, real support, data handling. It doesn’t change the Local Fit score.'
  return (
    <span
      title={title}
      className={`inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-pill pl-1.5 pr-2.5 text-xs font-semibold ${
        variant === 'outline' ? 'border-hairline border-border-ink text-text-strong' : 'bg-ink-900 text-cream-200'
      }`}
    >
      <Icon name="badge-check" size={15} strokeWidth={2} />
      {label}
    </span>
  )
}
