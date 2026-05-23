'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { upsertUserPreferences } from '@/features/settings/services/settings-service'
import type { UserPreferences } from '@/features/settings/types'

interface LanguageRegionSectionProps {
  userId: string
  preferences: UserPreferences | null
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
]

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

// Common IANA timezones — extensible
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Jakarta',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

export function LanguageRegionSection({ userId, preferences }: LanguageRegionSectionProps) {
  const router = useRouter()
  const [language, setLanguage] = useState(preferences?.language ?? 'en')
  const [timezone, setTimezone] = useState(preferences?.timezone ?? 'UTC')
  const [dateFormat, setDateFormat] = useState(preferences?.date_format ?? 'MM/DD/YYYY')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const result = await upsertUserPreferences(userId, { language, timezone, date_format: dateFormat })
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Language & region preferences saved')
      router.refresh()
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Language & Region</h2>
        <p className="text-sm text-muted-foreground">Set your language, timezone, and date format preferences.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Date Format</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? 'Saving…' : 'Save Preferences'}
      </Button>
    </div>
  )
}
