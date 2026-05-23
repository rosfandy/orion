'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
type Theme = 'light' | 'dark' | 'system'

const CYCLE: Theme[] = ['light', 'dark', 'system']

const ICONS: Record<Theme, React.ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
}

const LABELS: Record<Theme, string> = {
  light: 'Switch to dark mode (currently light)',
  dark: 'Switch to system mode (currently dark)',
  system: 'Switch to light mode (currently system)',
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const { theme, setTheme } = useTheme()

  const current: Theme = (CYCLE.includes(theme as Theme) ? (theme as Theme) : 'system')

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Monitor className="h-4 w-4" />
      </Button>
    )
  }

  function handleClick() {
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]
    setTheme(next)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={LABELS[current]}
      onClick={handleClick}
    >
      {ICONS[current]}
    </Button>
  )
}
