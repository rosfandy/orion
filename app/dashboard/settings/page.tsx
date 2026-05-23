import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/features/profile/services/profile-service'
import { getWorkspaces } from '@/features/workspaces/services/workspace-service'
import { getUserPreferences } from '@/features/settings/services/settings-service'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [profile, workspaces, preferences] = await Promise.all([
    getProfile(user.id),
    getWorkspaces(user.id),
    getUserPreferences(user.id),
  ])

  console.log("workspaces", workspaces)
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading settings…</div>}>
      <SettingsLayout
        profile={profile}
        preferences={preferences}
        workspaces={workspaces}
        userEmail={user.email ?? ''}
        userId={user.id}
      />
    </Suspense>
  )
}
