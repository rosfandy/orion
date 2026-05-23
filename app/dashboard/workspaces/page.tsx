import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/features/workspaces/services/workspace-service'
import { WorkspacesClient } from '@/features/workspaces/components/workspaces-client'
import { NavbarTitleUpdater } from '@/components/fragments/navbar-title-updater'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const workspaces = await getWorkspaces(user.id)

  return (
    <>
      <NavbarTitleUpdater title="Workspaces" />
      <WorkspacesClient initialWorkspaces={workspaces} />
    </>
  )
}
