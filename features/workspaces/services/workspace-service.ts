'use server'

import { createClient } from '@/lib/supabase/server'
import type { Workspace, WorkspaceInsert, WorkspaceUpdate } from '@/features/workspaces/types'

export async function getWorkspaces(userId: string): Promise<Workspace[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) return []
    return (data ?? []) as Workspace[]
  } catch {
    return []
  }
}

export async function getWorkspace(userId: string, id: string): Promise<Workspace | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()

    if (error) return null
    return data as Workspace
  } catch {
    return null
  }
}

export async function createWorkspace(
  userId: string,
  data: WorkspaceInsert,
): Promise<{ workspace?: Workspace; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({ ...data, owner_id: userId })
      .select()
      .single()

    if (error) return { error: error.message }
    return { workspace: workspace as Workspace }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function updateWorkspace(
  userId: string,
  id: string,
  data: WorkspaceUpdate,
): Promise<{ workspace?: Workspace; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .update(data)
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single()

    if (error) return { error: error.message }
    return { workspace: workspace as Workspace }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteWorkspace(
  userId: string,
  id: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId)

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function createWorkspaceAction(
  data: WorkspaceInsert,
): Promise<{ workspace?: Workspace; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  return createWorkspace(user.id, data)
}

export async function updateWorkspaceAction(
  id: string,
  data: WorkspaceUpdate,
): Promise<{ workspace?: Workspace; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  return updateWorkspace(user.id, id, data)
}

export async function deleteWorkspaceAction(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  return deleteWorkspace(user.id, id)
}
