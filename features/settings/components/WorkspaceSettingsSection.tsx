'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog'
import { useWorkspace } from '@/features/workspaces/hooks/use-workspace'
import type { Workspace } from '@/features/workspaces/types'

interface WorkspaceSettingsSectionProps {
  userId: string
  workspace: Workspace | null
}

export function WorkspaceSettingsSection({ userId, workspace }: WorkspaceSettingsSectionProps) {
  const router = useRouter()
  const isOwner = workspace?.owner_id === userId

  const [name, setName] = useState(workspace?.name ?? '')
  const [description, setDescription] = useState(workspace?.description ?? '')
  const [icon, setIcon] = useState(workspace?.icon ?? '')
  const [nameError, setNameError] = useState('')
  const { updateWorkspace, deleteWorkspace } = useWorkspace()

  if (!workspace) {
    return (
      <div className="space-y-4 max-w-2xl">
        <h2 className="text-lg font-semibold">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground">No workspace is currently active. Select or create a workspace first.</p>
      </div>
    )
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError('Workspace name is required')
      return
    }
    if (name.trim().length > 80) {
      setNameError('Max 80 characters')
      return
    }
    setNameError('')
    updateWorkspace.mutate(
      {
        id: workspace!.id,
        data: {
          name: name.trim(),
          description: description || null,
          icon: icon || null,
        },
      },
      {
        onSuccess: (result) => {
          if (result.error) {
            toast.error(result.error)
          } else {
            toast.success('Workspace updated')
            router.refresh()
          }
        },
        onError: () => toast.error('Something went wrong. Please try again.'),
      },
    )
  }

  async function handleDelete() {
    deleteWorkspace.mutate(workspace!.id, {
      onSuccess: (result) => {
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Workspace deleted')
          router.push('/dashboard')
        }
      },
      onError: () => toast.error('Something went wrong. Please try again.'),
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your workspace details.</p>
        {!isOwner && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 font-medium">
            Only the owner can edit workspace settings.
          </p>
        )}
      </div>

      <section className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="ws-name">Workspace name *</Label>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError('')
            }}
            maxLength={81}
            placeholder="My Workspace"
            readOnly={!isOwner}
            disabled={!isOwner}
          />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="ws-icon">Icon (emoji or URL)</Label>
          <Input
            id="ws-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🏢 or https://..."
            readOnly={!isOwner}
            disabled={!isOwner}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="ws-desc">Description</Label>
          <Textarea
            id="ws-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this workspace for?"
            maxLength={200}
            rows={3}
            readOnly={!isOwner}
            disabled={!isOwner}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{description.length}/200</p>
        </div>

        {isOwner && (
          <Button onClick={handleSave} disabled={updateWorkspace.isPending} size="sm">
            {updateWorkspace.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        )}
      </section>

      {isOwner && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a workspace is permanent and cannot be undone.
            </p>
            <DeleteWorkspaceDialog
              workspaceName={workspace.name}
              onConfirm={handleDelete}
            />
          </section>
        </>
      )}
    </div>
  )
}
