import Link from 'next/link'
import type { Tool } from '@/types'
import { computeLocalFit } from '@/lib/localFit'
import { LocalFitMeter } from '../LocalFitMeter'
import { EmptyState } from '../EmptyState'

interface StacksTabProps {
  tools: Tool[]
  marketId: string
  marketName: string
}

// A stack is the real tools grouped by category — up to 3 per category.
// The original design's stacks show a summed monthly total; we don't fabricate
// one here since price_label is free text ("Free / $20 mo") and can't be
// reliably parsed into a number. Each stack links to Compare instead.
export function StacksTab({ tools, marketId, marketName }: StacksTabProps) {
  const byCategory = new Map<string, Tool[]>()
  for (const tool of tools) {
    const list = byCategory.get(tool.category) ?? []
    if (list.length < 3) list.push(tool)
    byCategory.set(tool.category, list)
  }
  const stacks = Array.from(byCategory.entries()).filter(([, list]) => list.length >= 2)

  if (stacks.length === 0) {
    return (
      <EmptyState
        kind="empty"
        title="No stacks yet."
        body="A stack needs at least two tools in the same category. Check back once the directory grows."
      />
    )
  }

  return (
    <div className="grid gap-5 py-2 sm:grid-cols-2 xl:grid-cols-3">
      {stacks.map(([category, list]) => (
        <article key={category} className="flex flex-col gap-4 rounded-lg border-hairline border-border-hairline bg-surface-raised p-5">
          <div>
            <p className="font-mono text-label font-medium uppercase tracking-label text-text-muted">{category}</p>
            <h2 className="mt-1 text-title-2 font-bold text-text-strong">The {category} stack</h2>
          </div>
          <ul className="grid gap-3">
            {list.map((tool) => {
              const fit = computeLocalFit(tool, marketId, marketName)
              return (
                <li key={tool.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-inset font-display text-sm font-bold text-ink-700">
                    {tool.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/tools/${tool.slug}`} className="font-semibold text-text-strong no-underline hover:underline">
                      {tool.name}
                    </Link>
                    <LocalFitMeter fit={fit} showLabel={false} size="md" />
                  </span>
                  <span className="shrink-0 font-mono text-[13px] text-text-strong">{tool.price_label ?? tool.price_type}</span>
                </li>
              )
            })}
          </ul>
          <Link
            href={`/compare?tools=${list.map((t) => t.slug).join(',')}`}
            className="mt-auto text-sm font-semibold text-text-link no-underline hover:underline"
          >
            Compare these tools →
          </Link>
        </article>
      ))}
    </div>
  )
}
