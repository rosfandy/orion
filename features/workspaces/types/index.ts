export interface Workspace {
  id: string
  name: string
  description: string | null
  icon: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type WorkspaceInsert = Pick<Workspace, 'name'> & {
  description?: string | null
  icon?: string | null
}

export type WorkspaceUpdate = Partial<WorkspaceInsert>


