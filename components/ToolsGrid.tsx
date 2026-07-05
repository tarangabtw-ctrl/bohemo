'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ToolCard from '@/components/ToolCard'
import type { Tool } from '@/types'

const MAX_COMPARE = 3

interface Props {
  tools: Tool[]
}

export default function ToolsGrid({ tools }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, slug]
    })
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            selectable
            selected={selected.includes(tool.slug)}
            selectionDisabled={selected.length >= MAX_COMPARE}
            onToggleSelect={toggle}
          />
        ))}
      </div>

      {selected.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            type="button"
            onClick={() => router.push(`/tools/compare?tools=${selected.join(',')}`)}
            className="inline-flex items-center justify-center min-h-[44px] rounded-full bg-ink border border-black/10 px-6 py-3 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
          >
            Compare ({selected.length})
          </button>
        </div>
      )}
    </div>
  )
}
