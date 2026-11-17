interface SkeletonProps {
  variant?: 'card' | 'lines' | 'mark'
  label?: string
}

const PULSE = 'animate-pulse-fade motion-reduce:animate-none bg-fill-skeleton'

export function Skeleton({ variant = 'mark', label = 'Loading' }: SkeletonProps) {
  let body: React.ReactNode
  if (variant === 'card') {
    body = (
      <div className="flex flex-col gap-4 rounded-lg border-hairline border-border-hairline p-5">
        <div className="flex items-center gap-3">
          <span className={`h-11 w-11 rounded-md ${PULSE}`} />
          <div className="flex flex-1 flex-col gap-2">
            <span className={`h-3.5 w-[55%] rounded-pill ${PULSE}`} />
            <span className={`h-2.5 w-[30%] rounded-pill ${PULSE}`} />
          </div>
        </div>
        <span className={`h-2.5 w-full rounded-pill ${PULSE}`} />
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${PULSE}`} />
          ))}
        </div>
      </div>
    )
  } else if (variant === 'lines') {
    body = (
      <div className="grid gap-2.5">
        {[100, 92, 64].map((w, i) => (
          <span key={i} className={`h-3.5 rounded-pill ${PULSE}`} style={{ width: `${w}%` }} />
        ))}
      </div>
    )
  } else {
    body = (
      <div className="grid gap-2.5">
        <div className="flex gap-2.5">
          <span className={`h-2.5 flex-[3] rounded-pill ${PULSE}`} />
          <span className={`h-2.5 w-2.5 rounded-full ${PULSE}`} />
        </div>
        <div className="flex gap-2.5">
          <span className={`h-2.5 flex-1 rounded-pill ${PULSE}`} />
        </div>
        <div className="flex gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${PULSE}`} />
          <span className={`h-2.5 flex-[3] rounded-pill ${PULSE}`} />
        </div>
      </div>
    )
  }
  return (
    <div role="status" aria-label={label}>
      {body}
    </div>
  )
}
