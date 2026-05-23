import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspace } from '@/features/workspaces/services/workspace-service'
import { NavbarTitleUpdater } from '@/components/fragments/navbar-title-updater'

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  const { workspaceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const workspace = await getWorkspace(user.id, workspaceId)
  if (!workspace) redirect('/dashboard/workspaces')

  return (
    <>
      <NavbarTitleUpdater title={workspace.name} />
      {children}
    </>
  )
}
