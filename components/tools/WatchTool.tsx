'use client'

import { useId, useState } from 'react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { GET_PRO_HREF } from '@/lib/pricing'

/** "Watch this tool" is a Pro feature. Until Pro opens, the button explains that and points to Pricing. */
export function WatchTool() {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="grid gap-2.5 border-t-hairline border-border-hairline pt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-hit-min w-full items-center justify-center gap-2 rounded-pill border-thin border-action-secondary-border bg-action-secondary-bg px-[22px] text-[15px] font-semibold text-text-strong outline-none hover:bg-cream-300 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
      >
        <Icon name="lock" size={18} />
        Watch this tool
        <span className="ml-1 rounded-pill border-hairline border-current px-2 py-0.5 font-mono text-[11px] uppercase tracking-label">Pro</span>
      </button>
      <div id={id}>
        {open ? (
          <div className="grid justify-items-start gap-2.5">
            <p className="text-body-sm text-text-body">Watching is part of Pro. We tell you when the price or features change.</p>
            <Button href={GET_PRO_HREF}>Get Pro</Button>
          </div>
        ) : (
          <p className="text-body-sm text-text-muted">Get an alert when the price or features change.</p>
        )}
      </div>
    </div>
  )
}
