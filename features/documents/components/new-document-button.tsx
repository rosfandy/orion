'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useDocument } from '@/features/documents/hooks/use-document'

interface NewDocumentButtonProps {
  workspaceId: string
}

export function NewDocumentButton({ workspaceId }: NewDocumentButtonProps) {
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
    <Button onClick={handleClick} disabled={createDocument.isPending} className="gap-2 shrink-0">
      <Plus className="h-4 w-4" />
      {createDocument.isPending ? 'Creating…' : 'New Document'}
    </Button>
  )
}
