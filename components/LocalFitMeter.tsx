import type { LocalFit } from '@/lib/localFit'

interface LocalFitMeterProps {
  fit: LocalFit
  size?: 'md' | 'lg'
  showLabel?: boolean
  showCount?: boolean
}

// 5 dots, no half dots. "[N] confirmed · [M] not checked yet" — never "N/5".
export function LocalFitMeter({ fit, size = 'md', showLabel = true, showCount = true }: LocalFitMeterProps) {
  const dotSize = size === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'
  const countText =
    fit.notCheckedYet > 0 ? `${fit.confirmed} confirmed · ${fit.notCheckedYet} not checked yet` : `${fit.confirmed} confirmed`
  return (
    <span
      className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1"
      role="img"
      aria-label={`Local Fit: ${countText}`}
    >
      {showLabel && <span className="text-[12.5px] font-semibold text-text-muted">Local Fit</span>}
      <span className="inline-flex gap-1" aria-hidden="true">
        {fit.dots.map((on, i) => (
          <span
            key={i}
            className={`${dotSize} rounded-full border-thin ${on ? 'border-mark-filled bg-mark-filled' : 'border-mark-empty bg-transparent'}`}
          />
        ))}
      </span>
      {showCount && <span className="whitespace-nowrap font-mono text-[13px] font-medium text-text-strong">{countText}</span>}
    </span>
  )
}
