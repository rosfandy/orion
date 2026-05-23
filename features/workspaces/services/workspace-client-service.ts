import { createClient } from '@/lib/supabase/client'
import type { Workspace } from '@/features/workspaces/types'

export async function getWorkspacesClient(): Promise<Workspace[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as Workspace[]
}

export async function getWorkspaceClient(id: string): Promise<Workspace | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error) return null
  return data as Workspace
}
