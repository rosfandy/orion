import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkspaceEmptyStateProps {
  onNew: () => void
}

export function WorkspaceEmptyState({ onNew }: WorkspaceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <FolderOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">No workspaces yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Create your first workspace to start organizing your documents.
        </p>
      </div>
      <Button variant="outline" onClick={onNew}>
        Create your first workspace
      </Button>
    </div>
  )
}
