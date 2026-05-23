import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWorkspace } from '@/features/workspaces/services/workspace-service'
import { getDocuments } from '@/features/documents/services/document-service'
import { NewDocumentButton } from '@/features/documents/components/new-document-button'
import { NewDocumentInlineButton } from '@/features/documents/components/new-document-inline-button'

interface WorkspaceDetailPageProps {
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { workspaceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const workspace = await getWorkspace(user.id, workspaceId)
  if (!workspace) redirect('/dashboard/workspaces')

  const documents = await getDocuments(user.id, workspaceId)

  return (
    <div className="flex flex-col max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-10">
        <Link
          href="/dashboard/workspaces"
          className="hover:text-foreground transition-colors"
        >
          Workspaces
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">{workspace.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        <div className="text-[56px] leading-none select-none mb-3">
          {workspace.icon ?? '📁'}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{workspace.name}</h1>
        {workspace.description && (
          <p className="text-muted-foreground mt-1.5">{workspace.description}</p>
        )}
      </div>

      {/* Separator + header row */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Documents
          </span>
          <NewDocumentButton workspaceId={workspaceId} />
        </div>

        {/* Document list */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/dashboard/workspaces/${workspaceId}/documents/${doc.id}`}
                className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40 transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm font-medium truncate">{doc.title}</span>
                <span className="text-xs text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(doc.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Notion-style "+ New page" row */}
        <NewDocumentInlineButton workspaceId={workspaceId} />
      </div>
    </div>
  )
}
