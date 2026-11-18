'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Tool } from '@/types'
import { PRICE_TYPES } from '@/types'
import { computeLocalFit, localFitNotes, FIT_STATUS_LABEL, type FitStatus } from '@/lib/localFit'
import { MARKETS } from '@/lib/markets'
import { track } from '@/lib/analytics'
import { formatDate, priceLabel } from '@/lib/utils'
import { useCompareTray } from '@/lib/savedAndCompare'
import { useMarket } from '../MarketProvider'
import { LocalFitMeter } from '../LocalFitMeter'
import { VerifiedBadge } from '../VerifiedBadge'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Tag } from '../Tag'
import { EmptyState } from '../EmptyState'

interface CompareViewProps {
  tools: Tool[]
}

const NC = 'Not checked yet'
const MAX = 3

type Cell = { kind: 'fit'; status: FitStatus; note: string } | { kind: 'text'; text: string }
interface Row {
  label: string
  cells: Cell[]
}
interface Group {
  title: string
  fit?: boolean
  mono?: boolean
  rows: Row[]
}

const text = (t: string): Cell => ({ kind: 'text', text: t })
const list = (value: string[] | null, none: string) => text(value === null ? NC : value.length > 0 ? value.join(', ') : none)
const cellKey = (c: Cell) => (c.kind === 'fit' ? `${c.status}:${c.note}` : c.text)

function buildGroups(tools: Tool[], marketId: string, marketName: string): Group[] {
  const fits = tools.map((t) => ({ fit: computeLocalFit(t, marketId, marketName), notes: localFitNotes(t, marketId, marketName) }))
  const localPrices = (t: Tool) => {
    const keys = Object.keys(t.local_pricing ?? {})
    return text(t.local_pricing === null ? NC : keys.length > 0 ? keys.join(', ') : 'None')
  }
  return [
    {
      title: 'Local Fit',
      fit: true,
      rows: fits[0]
        ? fits[0].fit.criteria.map((c, i) => ({
            label: c.label,
            cells: fits.map((f) => ({ kind: 'fit' as const, status: f.fit.criteria[i].status, note: f.notes[i] })),
          }))
        : [],
    },
    {
      title: 'Pricing',
      mono: true,
      rows: [
        { label: 'Price', cells: tools.map((t) => text(priceLabel(t))) },
        { label: 'Price type', cells: tools.map((t) => text(PRICE_TYPES.find((p) => p.value === t.price_type)?.label ?? t.price_type)) },
        { label: 'Local-currency prices', cells: tools.map(localPrices) },
        { label: 'Last checked', cells: tools.map((t) => text(t.last_checked ? formatDate(t.last_checked) : NC)) },
      ],
    },
    {
      title: 'Languages',
      rows: [{ label: 'Languages listed', cells: tools.map((t) => list(t.languages, 'None listed')) }],
    },
    {
      title: 'Payments',
      rows: [{ label: 'Payment methods', cells: tools.map((t) => list(t.payment_methods, 'None listed')) }],
    },
    {
      title: 'Best for',
      rows: [
        { label: 'Category', cells: tools.map((t) => text(t.category)) },
        { label: 'Tags', cells: tools.map((t) => text(t.tags.length > 0 ? t.tags.join(', ') : 'None')) },
        { label: 'Made in Asia', cells: tools.map((t) => text(t.made_in_asia === null ? NC : t.made_in_asia ? 'Yes' : 'No')) },
        // The Verified row stays hidden while no tool in the comparison has the badge.
        ...(tools.some((t) => t.verified_at)
          ? [{ label: 'Bohemo Verified', cells: tools.map((t) => text(t.verified_at ? 'Verified' : 'Not yet')) }]
          : []),
      ],
    },
  ]
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-[5px] h-3 w-3 shrink-0 rounded-full border-thin ${on ? 'border-mark-filled bg-mark-filled' : 'border-mark-empty'}`}
    />
  )
}

function CellView({ cell, mono }: { cell: Cell; mono?: boolean }) {
  if (cell.kind === 'fit') {
    return (
      <span className="grid grid-cols-[12px_minmax(0,1fr)] items-start gap-2.5">
        <Dot on={cell.status === 'pass'} />
        <span>
          <b className="block font-semibold">{FIT_STATUS_LABEL[cell.status]}</b>
          {cell.status !== 'unchecked' && <span className="block text-[14.5px] font-normal text-text-muted">{cell.note}</span>}
        </span>
      </span>
    )
  }
  return <span className={`${cell.text === NC ? 'font-normal text-text-muted' : ''} ${mono ? 'font-mono text-[14.5px]' : ''}`}>{cell.text}</span>
}

function ToolHead({ tool, fitTool, onRemove }: { tool: Tool; fitTool: ReturnType<typeof computeLocalFit>; onRemove?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-inset font-display text-lg font-extrabold text-ink-700"
        >
          {tool.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/tools/${tool.slug}`} className="font-display text-title-3 font-bold text-text-strong no-underline hover:underline">
            {tool.name}
          </Link>
          <div className="text-[13px] text-text-muted">{tool.category}</div>
        </div>
        {tool.verified_at && <VerifiedBadge variant="outline" />}
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove ${tool.name}`}
            onClick={onRemove}
            className="-mr-2.5 grid h-hit-min w-hit-min shrink-0 place-items-center rounded-full text-ink-700 outline-none hover:bg-cream-300 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
      <LocalFitMeter fit={fitTool} showLabel={false} />
      <p className="whitespace-nowrap font-mono text-data font-medium text-text-strong">{priceLabel(tool)}</p>
      <Button
        block
        variant="secondary"
        href={tool.url}
        external
        iconRight="arrow-up-right"
        onClick={() => track('outbound_tool_click', { slug: tool.slug, source: 'compare' })}
      >
        Try {tool.name}
      </Button>
    </>
  )
}

export function CompareView({ tools }: CompareViewProps) {
  const router = useRouter()
  const { market } = useMarket()
  const current = MARKETS.find((m) => m.id === market) ?? MARKETS[0]
  const { compare: tray, remove: removeFromTray } = useCompareTray()
  const [hideSame, setHideSame] = useState(false)
  const [active, setActive] = useState(0)
  const [dragX, setDragX] = useState(0)
  const drag = useRef<{ x: number; y: number; on: boolean } | null>(null)
  const panelRefs = useRef<(HTMLElement | null)[]>([])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Hidden mobile panels are inert so keyboard and screen readers skip them.
  useEffect(() => {
    panelRefs.current.forEach((el, i) => {
      if (!el) return
      if (i === active) el.removeAttribute('inert')
      else el.setAttribute('inert', '')
    })
  }, [active, tools.length])

  useEffect(() => {
    if (active > tools.length - 1) setActive(Math.max(0, tools.length - 1))
  }, [active, tools.length])

  // Once per set of tools: removing one from the comparison counts as a new comparison.
  const toolKey = tools.map((t) => t.slug).join(',')
  useEffect(() => {
    if (toolKey) track('compare_opened', { tools: toolKey.split(','), count: toolKey.split(',').length })
  }, [toolKey])

  if (tools.length === 0) {
    return (
      <div className="mx-auto max-w-container px-4 md:px-6">
        <EmptyState
          title="Pick tools to compare."
          body={
            tray.length > 0
              ? `You have ${tray.length} ${tray.length === 1 ? 'tool' : 'tools'} picked. Compare them, or add more from the directory.`
              : 'Choose 2 or 3 tools in the directory with the Compare button. They stay picked as you browse.'
          }
          actionLabel={tray.length > 0 ? 'Compare your picks' : 'Browse tools'}
          actionHref={tray.length > 0 ? `/compare?tools=${tray.join(',')}` : '/tools'}
        />
      </div>
    )
  }

  const fits = tools.map((t) => computeLocalFit(t, current.id, current.name))
  const groups = buildGroups(tools, current.id, current.name)
  const allRows = groups.flatMap((g) => g.rows)
  const isSame = (r: Row) => tools.length > 1 && r.cells.every((c) => cellKey(c) === cellKey(r.cells[0]))
  const sameCount = allRows.filter(isSame).length
  const word = tools.length === 3 ? 'all three' : 'both'
  const slots: (Tool | null)[] = [0, 1, 2].map((i) => tools[i] ?? null)

  function removeTool(slug: string) {
    removeFromTray(slug)
    const rest = tools.filter((t) => t.slug !== slug).map((t) => t.slug)
    router.replace(rest.length > 0 ? `/compare?tools=${rest.join(',')}` : '/compare', { scroll: false })
  }

  const go = (i: number) => setActive(Math.max(0, Math.min(tools.length - 1, i)))

  function onTabKey(e: React.KeyboardEvent, i: number) {
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % tools.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tools.length) % tools.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tools.length - 1
    else return
    e.preventDefault()
    go(next)
    tabRefs.current[next]?.focus()
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, on: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const mx = e.clientX - d.x
    const my = e.clientY - d.y
    if (!d.on && Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) d.on = true
    if (d.on) setDragX(mx)
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (d?.on) {
      if (dragX < -40) go(active + 1)
      else if (dragX > 40) go(active - 1)
    }
    setDragX(0)
  }

  const fallback = current.id !== 'in' && ` Scored and priced for India until we cover ${current.name}.`
  const ROW = 'grid grid-cols-[216px_repeat(3,minmax(0,1fr))] gap-x-6'

  return (
    <div className="mx-auto max-w-container pb-10 md:px-6 md:pb-14">
      <div className="px-4 md:px-0">
        <nav aria-label="Breadcrumb" className="mt-1 md:mt-4">
          <ol className="flex items-center gap-2 font-mono text-[13px] text-ink-700">
            <li>
              <Link href="/tools" className="inline-flex min-h-hit-min items-center text-inherit no-underline hover:underline">
                Tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-text-strong">
              Compare
            </li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-4 pt-1 md:pb-7 md:pt-2">
          <div>
            <h1 className="font-display text-display-l font-extrabold text-text-strong">Compare for {current.name}</h1>
            <p className="mt-2 text-body text-text-muted md:mt-2.5 md:text-body-lg">
              {tools.length > 1 ? (
                <>
                  <b className="font-semibold text-text-strong">
                    {allRows.length - sameCount} {allRows.length - sameCount === 1 ? 'row differs' : 'rows differ'}.
                  </b>{' '}
                  {sameCount} {sameCount === 1 ? 'is' : 'are'} the same for {word}.
                </>
              ) : (
                'Add another tool to compare.'
              )}
              {fallback}
            </p>
          </div>
          {tools.length > 1 && (
            <label className="hidden min-h-hit-min cursor-pointer items-center gap-2.5 whitespace-nowrap font-semibold text-text-strong md:inline-flex">
              <input
                type="checkbox"
                checked={hideSame}
                onChange={(e) => setHideSame(e.target.checked)}
                className="h-5 w-5 accent-ink-900"
              />
              Hide what’s the same
            </label>
          )}
        </div>
      </div>

      {/* Desktop: side-by-side table */}
      <div className="hidden md:block" role="table" aria-label="Tool comparison">
        <div className={`${ROW} sticky top-[60px] z-10 border-b-hairline border-t-heavy border-ink-900 bg-surface-page py-5`} role="row">
          <div role="columnheader" className="self-end pb-1.5">
            <span className="font-mono text-label font-medium uppercase text-text-muted">
              {tools.length} of {MAX} tools
            </span>
          </div>
          {slots.map((tool, k) =>
            tool ? (
              <div key={tool.slug} role="columnheader" className="grid content-start gap-2.5">
                <ToolHead tool={tool} fitTool={fits[k]} onRemove={() => removeTool(tool.slug)} />
              </div>
            ) : (
              <div key={`empty-${k}`} role="columnheader">
                <Link
                  href="/tools"
                  className="flex h-full min-h-[120px] items-center justify-center gap-2 rounded-md border-thin border-dashed border-border-strong font-semibold text-ink-700 no-underline hover:border-ink-900"
                >
                  <Icon name="plus" size={18} />
                  Add a tool
                </Link>
              </div>
            ),
          )}
        </div>

        {groups.map((g) => {
          const rows = g.rows.filter((r) => !(hideSame && isSame(r)))
          return (
            <div role="rowgroup" key={g.title}>
              <div className={`${ROW} items-end border-b-hairline border-border-strong pb-3 pt-9`} role="row">
                <h2 role="cell" className="font-display text-title-2 font-bold text-text-strong">
                  {g.title}
                </h2>
                {g.fit && (
                  <p role="cell" className="col-span-3 flex items-center gap-2 text-body-sm text-text-muted">
                    <Dot on />
                    Confirmed
                    <span className="ml-3.5" />
                    <Dot on={false} />
                    Not confirmed
                  </p>
                )}
              </div>
              {rows.length === 0 && (
                <div className="border-b-hairline border-border-hairline py-4" role="row">
                  <p role="cell" className="text-text-muted">
                    Everything here is the same for {word}.
                  </p>
                </div>
              )}
              {rows.map((r) =>
                isSame(r) ? (
                  <div key={r.label} role="row" className={`${ROW} items-start border-b-hairline border-border-hairline py-4`}>
                    <div role="rowheader" className="text-[15px] font-medium leading-normal text-ink-700">
                      {r.label}
                    </div>
                    <div role="cell" className="col-span-3 flex flex-wrap items-baseline gap-x-3.5 gap-y-1 text-[15px] text-ink-700">
                      <span className="whitespace-nowrap font-mono text-[11.5px] uppercase tracking-label">Same for {word}</span>
                      <CellView cell={r.cells[0]} mono={g.mono} />
                    </div>
                  </div>
                ) : (
                  <div key={r.label} role="row" className={`${ROW} items-start border-b-hairline border-border-hairline py-4`}>
                    <div role="rowheader" className="text-[15px] font-semibold leading-normal">
                      {r.label}
                    </div>
                    {slots.map((tool, k) => (
                      <div key={k} role="cell" className="text-[15.5px] font-medium leading-normal text-text-strong">
                        {tool && <CellView cell={r.cells[k]} mono={g.mono} />}
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: one tool at a time, tabs or swipe to change */}
      <div className="md:hidden">
        <p className="px-4 text-body-sm text-text-muted">Swipe to change tool. Rows marked “Differs” are where they part ways.</p>
        <div
          role="tablist"
          aria-label="Tools being compared"
          className="sticky top-[60px] z-10 mt-4 grid grid-cols-3 gap-1.5 border-b-hairline border-t-heavy border-ink-900 bg-surface-page px-4 py-2.5"
        >
          {tools.map((t, i) => (
            <button
              key={t.slug}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`cmp-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`cmp-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => go(i)}
              onKeyDown={(e) => onTabKey(e, i)}
              className="flex min-h-hit-min min-w-0 items-center justify-center gap-1.5 rounded-pill border-hairline border-border-strong px-1.5 text-sm font-semibold text-ink-700 outline-none aria-selected:border-ink-900 aria-selected:bg-ink-900 aria-selected:text-cream-200 focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-2"
            >
              <span aria-hidden="true" className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-hairline border-current font-display text-xs">
                {t.name.charAt(0)}
              </span>
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
        <div
          className="touch-pan-y overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div
            className={`flex items-start ${dragX ? '' : 'transition-transform duration-slow ease-out motion-reduce:transition-none'}`}
            style={{ transform: `translateX(calc(${-active * 100}% + ${dragX}px))` }}
          >
            {tools.map((t, i) => (
              <section
                key={t.slug}
                ref={(el) => {
                  panelRefs.current[i] = el
                }}
                id={`cmp-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`cmp-tab-${i}`}
                aria-hidden={i !== active}
                className="min-w-0 flex-[0_0_100%] px-4 pb-8 pt-4"
              >
                <div className="grid gap-2.5 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5">
                  <ToolHead tool={t} fitTool={fits[i]} onRemove={tools.length > 1 ? () => removeTool(t.slug) : undefined} />
                </div>
                {groups.map((g) => (
                  <div key={g.title} className="pt-7">
                    <h2 className="border-b-hairline border-border-strong pb-2.5 font-display text-title-2 font-bold text-text-strong">{g.title}</h2>
                    {g.rows.map((r) => {
                      const same = isSame(r)
                      return (
                        <div
                          key={r.label}
                          className={`grid gap-1.5 border-b-hairline border-border-hairline py-3.5 text-[15.5px] leading-normal ${
                            same ? 'font-normal text-ink-700' : 'font-medium'
                          }`}
                        >
                          <p className="flex items-center justify-between gap-3">
                            <span className={`font-mono text-label font-medium uppercase ${same ? 'text-ink-700' : 'text-text-strong'}`}>{r.label}</span>
                            {tools.length > 1 &&
                              (same ? (
                                <span className="whitespace-nowrap font-mono text-[11.5px] uppercase tracking-label text-ink-700">Same for {word}</span>
                              ) : (
                                <Tag size="sm">Differs</Tag>
                              ))}
                          </p>
                          <CellView cell={r.cells[i]} mono={g.mono} />
                        </div>
                      )
                    })}
                  </div>
                ))}
                {tools.length < MAX && (
                  <Link
                    href="/tools"
                    className="mt-7 flex min-h-hit-min items-center justify-center gap-2 rounded-md border-thin border-dashed border-border-strong font-semibold text-ink-700 no-underline"
                  >
                    <Icon name="plus" size={18} />
                    Add a tool
                  </Link>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
