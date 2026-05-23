'use client'

import { cn } from '@/lib/utils'
import type { SettingsSection } from '@/features/settings/types'
import {
  User,
  UserCircle,
  Palette,
  Globe,
  Shield,
  Building2,
} from 'lucide-react'

interface NavItem {
  id: SettingsSection
  label: string
  icon: React.ReactNode
  group: 'account' | 'workspace'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'account', label: 'My Account', icon: <User className="h-4 w-4" />, group: 'account' },
  // { id: 'profile', label: 'My Profile', icon: <UserCircle className="h-4 w-4" />, group: 'account' },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" />, group: 'account' },
  // { id: 'language', label: 'Language & Region', icon: <Globe className="h-4 w-4" />, group: 'account' },
  // { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" />, group: 'account' },
  // { id: 'workspace', label: 'Workspace', icon: <Building2 className="h-4 w-4" />, group: 'workspace' },
]

interface SettingsNavProps {
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
  hasWorkspace: boolean
}

export function SettingsNav({ activeSection, onSectionChange, hasWorkspace }: SettingsNavProps) {
  const accountItems = NAV_ITEMS.filter((i) => i.group === 'account')
  const workspaceItems = NAV_ITEMS.filter((i) => i.group === 'workspace')

  return (
    <nav className="w-56 shrink-0 flex flex-col gap-1 pr-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1">
        Account
      </p>
      {accountItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left w-full transition-colors',
            activeSection === item.id
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      {hasWorkspace && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mt-4 mb-1">
            Workspace
          </p>
          {workspaceItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left w-full transition-colors',
                activeSection === item.id
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </>
      )}
    </nav>
  )
}
