'use client'

import { useEffect } from 'react'
import type { FontSize } from '@/features/settings/types'

interface FontSizeApplierProps {
  fontSize: FontSize
}

/**
 * Applies the user's saved font size preference to the <html> element on mount
 * and whenever the fontSize prop changes. This bridges the server-fetched
 * preference with the client-side CSS attribute.
 */
export function FontSizeApplier({ fontSize }: FontSizeApplierProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize])

  return null
}
