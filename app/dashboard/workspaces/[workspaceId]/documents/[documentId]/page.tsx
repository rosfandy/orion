import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspace } from '@/features/workspaces/services/workspace-service'
import { getDocument } from '@/features/documents/services/document-service'
import { DocumentEditor } from '@/features/documents/components/document-editor'

interface DocumentPageProps {
  params: Promise<{ workspaceId: string; documentId: string }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { workspaceId, documentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const workspace = await getWorkspace(user.id, workspaceId)
  if (!workspace) redirect('/dashboard/workspaces')

  const document = await getDocument(user.id, documentId)
  if (!document) redirect(`/dashboard/workspaces/${workspaceId}`)

  return (
    <DocumentEditor
      document={document}
      workspaceId={workspaceId}
      workspace={{ name: workspace.name, icon: workspace.icon }}
    />
  )
}
