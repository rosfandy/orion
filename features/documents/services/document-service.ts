'use server'

import { createClient } from '@/lib/supabase/server'
import type { Document, DocumentInsert, DocumentUpdate } from '@/features/documents/types'

export async function getDocuments(userId: string, workspaceId: string): Promise<Document[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (error) return []
    return (data ?? []) as Document[]
  } catch {
    return []
  }
}

export async function getDocument(userId: string, documentId: string): Promise<Document | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('owner_id', userId)
      .single()

    if (error) return null
    return data as Document
  } catch {
    return null
  }
}

export async function createDocument(
  userId: string,
  data: DocumentInsert,
): Promise<{ document?: Document; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: document, error } = await supabase
      .from('documents')
      .insert({ title: 'Untitled', ...data, owner_id: userId })
      .select()
      .single()

    if (error) return { error: error.message }
    return { document: document as Document }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function createDocumentAction(
  data: DocumentInsert,
): Promise<{ document?: Document; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  return createDocument(user.id, data)
}

export async function updateDocumentAction(
  id: string,
  data: DocumentUpdate,
): Promise<{ document?: Document; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: document, error } = await supabase
      .from('documents')
      .update(data)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) return { error: error.message }
    return { document: document as Document }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}
