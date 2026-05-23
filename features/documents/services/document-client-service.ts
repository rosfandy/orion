import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/features/documents/types'

export async function getDocumentsClient(workspaceId: string): Promise<Document[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return []
  return (data ?? []) as Document[]
}

export async function getDocumentClient(id: string): Promise<Document | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error) return null
  return data as Document
}
