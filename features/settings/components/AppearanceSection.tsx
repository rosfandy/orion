'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Sun, Moon, Monitor } from 'lucide-react'
import { upsertUserPreferences } from '@/features/settings/services/settings-service'
import type { FontSize, UserPreferences } from '@/features/settings/types'
import { useRouter } from 'next/navigation'

interface AppearanceSectionProps {
  userId: string
  preferences: UserPreferences | null
}

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

const FONT_SIZES: { value: FontSize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: 'Compact text size' },
  { value: 'default', label: 'Default', description: 'Standard text size' },
  { value: 'large', label: 'Large', description: 'Larger, easier to read' },
]

export function AppearanceSection({ userId, preferences }: AppearanceSectionProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>(preferences?.font_size ?? 'default')
  const [savingFont, setSavingFont] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  // Apply the initial font size from saved preferences on mount
  useEffect(() => {
    const initial = preferences?.font_size ?? 'default'
    document.documentElement.setAttribute('data-font-size', initial)
  }, [preferences?.font_size])

  async function handleFontSize(size: FontSize) {
    setFontSize(size)
    setSavingFont(true)
    const result = await upsertUserPreferences(userId, { font_size: size })
    setSavingFont(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      document.documentElement.setAttribute('data-font-size', size)
      toast.success('Font size updated')
      router.refresh()
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize the look and feel of the app.</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors cursor-pointer',
                mounted && theme === value
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Font Size</h3>
        <p className="text-xs text-muted-foreground">{savingFont ? 'Saving…' : 'Changes apply immediately'}</p>
        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZES.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => handleFontSize(value)}
              disabled={savingFont}
              className={cn(
                'flex flex-col items-start gap-1 rounded-lg border p-3 text-sm transition-colors cursor-pointer disabled:opacity-50',
                fontSize === value
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              <span className="font-medium">{label}</span>
              <span className="text-xs">{description}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
