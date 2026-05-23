'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

export function useSidebarCollapse(): { isCollapsed: boolean; toggle: () => void } {
  // SSR-safe: default to false (expanded) on server
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        startTransition(() => setIsCollapsed(stored === 'true'))
      }
    } catch {
      // localStorage unavailable (e.g. private mode) — stay expanded
    }
  }, [])

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // localStorage unavailable — toggle works in-memory
      }
      return next
    })
  }, [])

  return { isCollapsed, toggle }
}
