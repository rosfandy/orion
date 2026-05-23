'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SettingsNav } from './SettingsNav'
import { AccountSection } from './AccountSection'
import { ProfileSection } from './ProfileSection'
import { AppearanceSection } from './AppearanceSection'
import { LanguageRegionSection } from './LanguageRegionSection'
import { SecuritySection } from './SecuritySection'
import { WorkspaceSettingsSection } from './WorkspaceSettingsSection'
import type { SettingsSection } from '@/features/settings/types'
import type { Profile } from '@/features/profile/types'
import type { UserPreferences } from '@/features/settings/types'
import type { Workspace } from '@/features/workspaces/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SECTION_LABELS: Record<SettingsSection, string> = {
  account: 'My Account',
  profile: 'My Profile',
  appearance: 'Appearance',
  language: 'Language & Region',
  security: 'Security',
  workspace: 'Workspace',
}

interface SettingsLayoutProps {
  profile: Profile | null
  preferences: UserPreferences | null
  workspaces: Workspace[]
  userEmail: string
  userId: string
}

export function SettingsLayout({
  profile,
  preferences,
  workspaces,
  userEmail,
  userId,
}: SettingsLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const raw = searchParams.get('section') as SettingsSection | null
  const validSections: SettingsSection[] = ['profile', 'appearance', 'language', 'security', 'workspace']
  const activeSection: SettingsSection = raw && validSections.includes(raw) ? raw : 'account'

  const handleSectionChange = useCallback(
    (section: SettingsSection) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('section', section)
      router.push(`/dashboard/settings?${params.toString()}`)
    },
    [router, searchParams],
  )

  const currentWorkspace = workspaces[0] ?? null

  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 border-b">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and workspace settings</p>
      </div>

      {/* Mobile: section selector */}
      <div className="md:hidden pt-4 pb-2">
        <Select value={activeSection} onValueChange={(v) => handleSectionChange(v as SettingsSection)}>
          <SelectTrigger className="w-full">
            <SelectValue>{SECTION_LABELS[activeSection]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {validSections.map((s) => (
              <SelectItem key={s} value={s}>
                {SECTION_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 gap-8 pt-6 overflow-hidden">
        {/* Desktop: left nav */}
        <div className="hidden md:block">
          <SettingsNav
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            hasWorkspace={workspaces.length > 0}
          />
        </div>

        {/* Content panel */}
        <div className="flex-1 overflow-y-auto min-w-0">
          {activeSection === 'account' && (
            <AccountSection
              userId={userId}
              userEmail={userEmail}
              fullName={profile?.full_name ?? ''}
              avatarUrl={profile?.avatar_url ?? null}
            />
          )}
          {activeSection === 'profile' && (
            <ProfileSection
              userId={userId}
              bio={profile?.bio ?? ''}
              socialLinks={profile?.social_links ?? {}}
            />
          )}
          {activeSection === 'appearance' && <AppearanceSection userId={userId} preferences={preferences} />}
          {activeSection === 'language' && (
            <LanguageRegionSection userId={userId} preferences={preferences} />
          )}
          {activeSection === 'security' && <SecuritySection />}
          {activeSection === 'workspace' && (
            <WorkspaceSettingsSection
              userId={userId}
              workspace={currentWorkspace}
            />
          )}
        </div>
      </div>
    </div>
  )
}
