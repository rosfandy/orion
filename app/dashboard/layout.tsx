import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/features/profile/services/profile-service'
import { getWorkspaces } from '@/features/workspaces/services/workspace-service'
import { getUserPreferences } from '@/features/settings/services/settings-service'
import { Sidebar } from '@/components/fragments/sidebar'
import { Navbar } from '@/components/fragments/navbar'
import { NavbarTitleProvider } from '@/components/fragments/navbar-context'
import { FontSizeApplier } from '@/features/settings/components/FontSizeApplier'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userId = user.id
  const email = user.email ?? 'Unknown'
  const [profile, workspaces, preferences] = await Promise.all([
    getProfile(userId),
    getWorkspaces(userId),
    getUserPreferences(userId),
  ])
  const displayName = profile?.full_name ?? email
  const avatarUrl = profile?.avatar_url ?? null

  return (
    <NavbarTitleProvider>
      <FontSizeApplier fontSize={preferences?.font_size ?? 'default'} />
      <div className="flex h-screen overflow-hidden">
        <Sidebar initialWorkspaces={workspaces} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar title="Dashboard" displayName={displayName} avatarUrl={avatarUrl} />
          <main className="flex-1 overflow-y-auto p-6 bg-muted dark:bg-background">
            {children}
          </main>
        </div>
      </div>
    </NavbarTitleProvider>
  )
}
