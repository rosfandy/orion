'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import type { Workspace } from '@/features/workspaces/types'
import { WorkspaceFormDialog } from '@/features/workspaces/components/workspace-form-dialog'
import { DeleteWorkspaceDialog } from '@/features/workspaces/components/delete-workspace-dialog'
import { WorkspaceEmptyState } from '@/features/workspaces/components/workspace-empty-state'
import { useWorkspace } from '@/features/workspaces/hooks/use-workspace'

interface WorkspacesClientProps {
  initialWorkspaces: Workspace[]
}

interface WorkspaceRowProps {
  workspace: Workspace
}

function WorkspaceRow({ workspace }: WorkspaceRowProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            router.push(`/dashboard/workspaces/${workspace.id}`)
          }
        }}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer',
          'hover:bg-muted/50 transition-colors',
        )}
      >
        {/* Emoji icon */}
        <span className="text-[36px] leading-none select-none shrink-0 w-10 text-center">
          {workspace.icon ?? '📁'}
        </span>

        {/* Name + description */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-sm leading-snug truncate">{workspace.name}</span>
          {workspace.description && (
            <span className="text-xs text-muted-foreground truncate">{workspace.description}</span>
          )}
        </div>

        {/* Actions — hover-only */}
        <div
          className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Workspace actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <WorkspaceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        workspace={workspace}
      />
      <DeleteWorkspaceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        workspace={workspace}
      />
    </>
  )
}

export function WorkspacesClient({ initialWorkspaces }: WorkspacesClientProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const { getWorkspaces: { data: workspaces = initialWorkspaces } } = useWorkspace(initialWorkspaces)

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your documents into workspaces.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Workspace
        </Button>
      </div>

      <Separator className="my-4" />

      {/* List */}
      {workspaces.length === 0 ? (
        <WorkspaceEmptyState onNew={() => setCreateOpen(true)} />
      ) : (
        <div className="flex flex-col">
          {workspaces.map((workspace) => (
            <WorkspaceRow
              key={workspace.id}
              workspace={workspace}
            />
          ))}
        </div>
      )}

      <WorkspaceFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
