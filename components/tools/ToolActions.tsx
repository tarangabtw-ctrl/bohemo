'use client'

import { useState } from 'react'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { track } from '@/lib/analytics'
import { useSavedTools, useCompareTray } from '@/lib/savedAndCompare'
import { useMarket } from '../MarketProvider'
import { LocalFitMeter } from '../LocalFitMeter'
import { Button } from '../Button'
import { Icon } from '../Icon'

interface ToolActionsProps {
  tool: Tool
}

const CHIP =
  'inline-flex min-h-hit-min items-center justify-center gap-1.5 whitespace-nowrap rounded-pill border-thin border-border-strong bg-surface-raised px-2.5 text-sm font-semibold text-text-strong outline-none aria-pressed:border-ink-900 aria-pressed:bg-ink-900 aria-pressed:text-cream-200 disabled:cursor-not-allowed disabled:text-ink-600 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2'

/** The tool page's action card (Local Fit, Try, Save, Compare, Share) and the mobile sticky Try bar. */
export function ToolActions({ tool }: ToolActionsProps) {
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  const fit = computeLocalFit(tool, current.id, current.name)
  const { isSaved, toggle: toggleSave } = useSavedTools()
  const { isComparing, toggle: toggleCompare, compare, max } = useCompareTray()
  const [shared, setShared] = useState<'idle' | 'copied' | 'failed'>('idle')

  const saved = isSaved(tool.slug)
  const comparing = isComparing(tool.slug)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${tool.name} on Bohemo`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShared('copied')
    } catch (err) {
      // The reader closing the share sheet is not a failure.
      if (err instanceof DOMException && err.name === 'AbortError') return
      setShared('failed')
    }
  }

  const tryButton = (
    <Button block href={tool.url} external iconRight="arrow-up-right" onClick={() => track('outbound_tool_click', { slug: tool.slug, source: 'tool_page' })}>
      Try {tool.name}
    </Button>
  )

  return (
    <>
      <div className="grid gap-3.5 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5 md:p-6">
        <div className="grid gap-2">
          <p className="font-mono text-label font-medium uppercase text-text-muted">Local Fit for {current.name}</p>
          <LocalFitMeter fit={fit} size="lg" showLabel={false} />
        </div>
        {current.id !== 'in' && (
          <p className="flex items-start gap-2 text-body-sm text-text-body">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            <span>Scored and priced for India until we cover {current.name}.</span>
          </p>
        )}
        <div className="hidden md:block">{tryButton}</div>
        <p className="font-mono text-data-sm leading-normal text-text-muted md:text-center">Direct link · not an affiliate link</p>
        <div className="grid auto-cols-fr grid-flow-col gap-2">
          <button type="button" aria-pressed={saved} onClick={() => toggleSave(tool.slug)} className={`${CHIP} hidden md:inline-flex`}>
            <Icon name="bookmark" size={16} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            aria-pressed={comparing}
            disabled={!comparing && compare.length >= max}
            onClick={() => toggleCompare(tool.slug)}
            className={CHIP}
          >
            <Icon name={comparing ? 'check' : 'plus'} size={16} />
            Compare
          </button>
          <button type="button" onClick={share} className={CHIP}>
            <Icon name={shared === 'copied' ? 'check' : 'share-2'} size={16} />
            {shared === 'copied' ? 'Link copied' : shared === 'failed' ? 'Copy failed' : 'Share'}
          </button>
        </div>
        <p role="status" className="sr-only">
          {shared === 'copied' ? 'Link copied' : shared === 'failed' ? 'Could not copy the link' : ''}
        </p>
      </div>

      {/* Mobile: Try and Save stay in reach above the tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(theme(spacing.tabbar-h)+env(safe-area-inset-bottom))] z-30 flex items-center gap-2 border-t-heavy border-ink-900 bg-surface-raised px-4 py-2.5 md:hidden">
        <div className="flex-1">{tryButton}</div>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Saved ${tool.name}` : `Save ${tool.name}`}
          onClick={() => toggleSave(tool.slug)}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-hairline border-ink-900 bg-surface-page text-text-strong outline-none aria-pressed:bg-ink-900 aria-pressed:text-cream-200 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
        >
          <Icon name="bookmark" size={20} />
        </button>
      </div>
    </>
  )
}
