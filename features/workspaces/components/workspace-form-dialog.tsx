'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWorkspace } from '@/features/workspaces/hooks/use-workspace'
import type { Workspace } from '@/features/workspaces/types'

interface WorkspaceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace?: Workspace
}

interface FormContentProps {
  isEdit: boolean
  workspace?: Workspace
  onDone: () => void
}

function FormContent({ isEdit, workspace, onDone }: FormContentProps) {
  const [name, setName] = useState(workspace?.name ?? '')
  const [description, setDescription] = useState(workspace?.description ?? '')
  const [icon, setIcon] = useState(workspace?.icon ?? '')
  const [nameError, setNameError] = useState('')

  const { createWorkspace, updateWorkspace } = useWorkspace()
  const isPending = createWorkspace.isPending || updateWorkspace.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Name is required.')
      return
    }
    if (trimmedName.length > 80) {
      setNameError('Name must be 80 characters or fewer.')
      return
    }
    setNameError('')

    const data = {
      name: trimmedName,
      description: description.trim() || null,
      icon: icon.trim() || null,
    }

    if (isEdit && workspace) {
      updateWorkspace.mutate(
        { id: workspace.id, data },
        {
          onSuccess: (result) => {
            if (result.error) {
              toast.error(result.error)
              return
            }
            toast.success('Workspace updated.')
            onDone()
          },
          onError: () => toast.error('Something went wrong. Please try again.'),
        },
      )
    } else {
      createWorkspace.mutate(data, {
        onSuccess: (result) => {
          if (result.error) {
            toast.error(result.error)
            return
          }
          toast.success('Workspace created.')
          onDone()
        },
        onError: () => toast.error('Something went wrong. Please try again.'),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
      {/* Icon */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ws-icon">Icon (emoji)</Label>
        <Input
          id="ws-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={4}
          placeholder="e.g. 🚀"
          className="w-24"
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ws-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ws-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError('')
          }}
          maxLength={80}
          placeholder="e.g. My Project"
          aria-invalid={!!nameError}
        />
        {nameError && (
          <p className="text-xs text-destructive">{nameError}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ws-description">Description</Label>
        <Textarea
          id="ws-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          placeholder="What is this workspace for?"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save' : 'Create')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function WorkspaceFormDialog({
  open,
  onOpenChange,
  workspace,
}: WorkspaceFormDialogProps) {
  const isEdit = !!workspace

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Workspace' : 'New Workspace'}</DialogTitle>
        </DialogHeader>
        {/* key forces remount (reset form state) when dialog opens or workspace changes */}
        <FormContent
          key={open ? (workspace?.id ?? 'new') : 'closed'}
          isEdit={isEdit}
          workspace={workspace}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
