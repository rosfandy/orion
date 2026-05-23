'use client'

import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useWorkspace } from '@/features/workspaces/hooks/use-workspace'
import type { Workspace } from '@/features/workspaces/types'

interface DeleteWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: Workspace
}

export function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
}: DeleteWorkspaceDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { deleteWorkspace } = useWorkspace()

  function handleConfirm() {
    deleteWorkspace.mutate(workspace.id, {
      onSuccess: (result) => {
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success('Workspace deleted.')
        onOpenChange(false)
        // Navigate away if we're inside this workspace
        if (pathname.startsWith(`/dashboard/workspaces/${workspace.id}`)) {
          router.push('/dashboard/workspaces')
        }
      },
      onError: () => toast.error('Something went wrong. Please try again.'),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{workspace.name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the workspace and all its documents. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteWorkspace.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteWorkspace.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteWorkspace.isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
