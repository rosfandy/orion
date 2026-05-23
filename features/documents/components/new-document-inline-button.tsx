'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDocument } from '@/features/documents/hooks/use-document'

interface NewDocumentInlineButtonProps {
  workspaceId: string
}

export function NewDocumentInlineButton({ workspaceId }: NewDocumentInlineButtonProps) {
  const router = useRouter()
  const { createDocument } = useDocument(workspaceId)

  function handleClick() {
    createDocument.mutate(
      { workspace_id: workspaceId },
      {
        onSuccess: (result) => {
          if (result.error) {
            toast.error(result.error)
            return
          }
          if (result.document) {
            router.push(`/dashboard/workspaces/${workspaceId}/documents/${result.document.id}`)
          }
        },
        onError: () => toast.error('Failed to create document. Please try again.'),
      },
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={createDocument.isPending}
      className={cn(
        'group flex items-center gap-2 w-full rounded-md px-2 py-2 mt-1',
        'text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      <Plus className="h-4 w-4 shrink-0" />
      <span>{createDocument.isPending ? 'Creating…' : 'New page'}</span>
    </button>
  )
}
