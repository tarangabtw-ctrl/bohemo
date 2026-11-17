interface LogoProps {
  variant?: 'mark' | 'lockup'
  tone?: 'ink' | 'reversed'
  size?: number
  className?: string
}

// Mark SVGs are inlined in /public/brand; the lockup wordmark is a PNG until a vector exists.
export function Logo({ variant = 'mark', tone = 'ink', size = 28, className = '' }: LogoProps) {
  if (variant === 'lockup') {
    const src = tone === 'reversed' ? '/brand/bohemo-lockup-inverse.png' : '/brand/bohemo-lockup.png'
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="Bohemo" className={`block ${className}`} style={{ height: size, width: 'auto' }} />
  }
  const src = tone === 'reversed' ? '/brand/bohemo-mark-reversed.svg' : '/brand/bohemo-mark.svg'
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt="Bohemo"
      className={`block shrink-0 ${className}`}
      style={{ height: size, width: 'auto' }}
    />
  )
}
