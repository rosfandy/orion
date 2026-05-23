'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'

interface DeleteWorkspaceDialogProps {
  workspaceName: string
  onConfirm: () => Promise<void>
}

export function DeleteWorkspaceDialog({ workspaceName, onConfirm }: DeleteWorkspaceDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  const isMatch = confirmInput === workspaceName

  async function handleDelete() {
    if (!isMatch) return
    setDeleting(true)
    try {
      await onConfirm()
      setOpen(false)
      setConfirmInput('')
    } finally {
      setDeleting(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setConfirmInput('')
    }
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workspace</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All data in this workspace will be lost.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="confirm-name">
            Type <strong>{workspaceName}</strong> to confirm
          </Label>
          <Input
            id="confirm-name"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={workspaceName}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isMatch || deleting}
          >
            {deleting ? 'Deleting…' : 'Delete Workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
