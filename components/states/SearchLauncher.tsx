'use client'

import { openSearch } from '@/lib/search'
import { Icon } from '../Icon'

/** Looks like a search bar; opens the command search. Used on the 404 page. */
export function SearchLauncher() {
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      aria-keyshortcuts="/"
      className="flex h-14 w-full items-center gap-3 rounded-pill border-thick border-ink-900 bg-surface-raised px-5 text-left text-ink-600 outline-none hover:bg-surface-overlay focus-visible:outline focus-visible:outline-thick focus-visible:outline-focus-ring focus-visible:outline-offset-[3px]"
    >
      <Icon name="search" size={20} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate font-body text-base">Search tasks, tools and stories</span>
      <span className="hidden rounded-xs bg-cream-300 px-2 font-mono text-xs text-ink-700 md:inline" aria-hidden="true">
        /
      </span>
    </button>
  )
}
