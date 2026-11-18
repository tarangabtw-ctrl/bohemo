'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * While `active`, Tab and Shift+Tab stay inside `ref`, and Escape calls `onEscape`.
 * When it turns off, focus goes back to whatever had it before it opened.
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean, onEscape?: () => void) {
  // Kept in a ref so a new onEscape function each render doesn't re-run the effect (which would move focus).
  const escapeRef = useRef(onEscape)
  escapeRef.current = onEscape

  useEffect(() => {
    if (!active) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null

    function onKeyDown(e: KeyboardEvent) {
      const root = ref.current
      if (!root) return
      if (e.key === 'Escape' && escapeRef.current) {
        e.preventDefault()
        escapeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Return focus to the opener, if it's still on the page.
      if (opener && document.contains(opener)) requestAnimationFrame(() => opener.focus())
    }
  }, [ref, active])
}
