'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, ChevronDown, FileText, Plus, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDocument } from '@/features/documents/hooks/use-document'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Workspace } from '@/features/workspaces/types'

interface SidebarWorkspaceItemProps {
  workspace: Workspace
  isCollapsed: boolean
  onClose: () => void
}

export function SidebarWorkspaceItem({
  workspace,
  isCollapsed,
  onClose,
}: SidebarWorkspaceItemProps) {
  const pathname = usePathname()
  const router = useRouter()
  const workspaceHref = `/dashboard/workspaces/${workspace.id}`
  const isWorkspaceActive = pathname.startsWith(workspaceHref)
  const [isExpanded, setIsExpanded] = useState(isWorkspaceActive)

  const { getDocuments: { data: documents = [], isFetching: isLoadingDocs }, createDocument } = useDocument(
    isExpanded ? workspace.id : undefined,
  )

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    setIsExpanded((prev) => !prev)
  }

  function handleWorkspaceClick() {
    router.push(workspaceHref)
    onClose()
  }

  function handleNewDoc() {
    createDocument.mutate(
      { workspace_id: workspace.id },
      {
        onSuccess: (result) => {
          if (result.error) {
            toast.error(result.error)
            return
          }
          if (result.document) {
            if (!isExpanded) setIsExpanded(true)
            router.push(
              `/dashboard/workspaces/${workspace.id}/documents/${result.document.id}`,
            )
            onClose()
          }
        },
        onError: () => {
          toast.error('Failed to create document. Please try again.')
        },
      },
    )
  }

  const rowContent = (
    <div
      className={cn(
        'flex items-center rounded-md transition-colors cursor-pointer select-none',
        isCollapsed ? 'justify-center px-0 py-2' : 'gap-1 px-1 py-1.5',
        isWorkspaceActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      {/* Chevron toggle (only when expanded sidebar) */}
      {!isCollapsed && (
        <button
          onClick={handleToggle}
          className="flex items-center justify-center h-5 w-5 shrink-0 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {/* Icon + Name */}
      <button
        onClick={handleWorkspaceClick}
        className={cn(
          'flex flex-1 items-center min-w-0',
          isCollapsed ? 'justify-center' : 'gap-2',
        )}
      >
        <span className="text-base leading-none shrink-0">
          {workspace.icon ?? <FolderOpen className="h-4 w-4" />}
        </span>
        {!isCollapsed && (
          <span className="text-sm font-medium truncate">{workspace.name}</span>
        )}
      </button>
    </div>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{rowContent}</div>
        </TooltipTrigger>
        <TooltipContent side="right">{workspace.name}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex flex-col">
      {rowContent}

      {isExpanded && (
        <div className="ml-6 flex flex-col gap-0.5 mt-0.5">
          {isLoadingDocs && (
            <p className="text-xs text-muted-foreground px-2 py-1">Loading…</p>
          )}

          {!isLoadingDocs && documents.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">No documents yet</p>
          )}

          {!isLoadingDocs &&
            documents.map((doc) => {
              const docHref = `/dashboard/workspaces/${workspace.id}/documents/${doc.id}`
              const isDocActive = pathname === docHref
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    router.push(docHref)
                    onClose()
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors w-full text-left',
                    isDocActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </button>
              )
            })}

          {/* New Doc button */}
          <button
            onClick={handleNewDoc}
            disabled={createDocument.isPending}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {createDocument.isPending ? 'Creating…' : '+ New Document'}
          </button>
        </div>
      )}
    </div>
  )
}
