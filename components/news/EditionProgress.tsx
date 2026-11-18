interface EditionProgressProps {
  total: number
  /** Stories read so far. */
  done: number
  /** 1-based story the reader is on; that step draws as a long pill. Omit for none. */
  current?: number
  label: React.ReactNode
  inverse?: boolean
}

/** The edition's pill-and-dot progress row: read = soft filled, current = long ink pill, unread = outline. */
export function EditionProgress({ total, done, current, label, inverse = false }: EditionProgressProps) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex items-center gap-[5px]" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1
          const isCurrent = step === current
          const isDone = !isCurrent && step <= done
          return (
            <span
              key={i}
              className={`h-2.5 rounded-pill transition-[width,background-color] duration-slow ease-out motion-reduce:transition-none ${
                isCurrent ? 'w-8' : 'w-2.5'
              } ${
                inverse
                  ? isCurrent || isDone
                    ? 'bg-cream-200'
                    : 'border-thin border-sand-300'
                  : isCurrent
                    ? 'bg-mark-filled'
                    : isDone
                      ? 'bg-mark-filled-soft'
                      : 'border-thin border-mark-empty'
              }`}
            />
          )
        })}
      </div>
      <span className={`whitespace-nowrap font-mono text-[12.5px] ${inverse ? 'text-sand-300' : 'text-text-muted [&_b]:font-medium [&_b]:text-text-strong'}`}>
        {label}
      </span>
    </div>
  )
}
