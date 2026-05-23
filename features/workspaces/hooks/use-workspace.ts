'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { getWorkspacesClient, getWorkspaceClient } from '@/features/workspaces/services/workspace-client-service'
import {
  createWorkspaceAction,
  updateWorkspaceAction,
  deleteWorkspaceAction,
} from '@/features/workspaces/services/workspace-service'
import type { Workspace, WorkspaceInsert, WorkspaceUpdate } from '@/features/workspaces/types'

export const WORKSPACES_KEY = ['workspaces'] as const

type GetWorkspacesResult = UseQueryResult<Workspace[], Error>
type CreateWorkspaceResult = UseMutationResult<
  Awaited<ReturnType<typeof createWorkspaceAction>>,
  Error,
  WorkspaceInsert
>
type UpdateWorkspaceResult = UseMutationResult<
  Awaited<ReturnType<typeof updateWorkspaceAction>>,
  Error,
  { id: string; data: WorkspaceUpdate }
>
type DeleteWorkspaceResult = UseMutationResult<
  Awaited<ReturnType<typeof deleteWorkspaceAction>>,
  Error,
  string
>

type UseWorkspaceReturn = {
  getWorkspaces: GetWorkspacesResult
  createWorkspace: CreateWorkspaceResult
  updateWorkspace: UpdateWorkspaceResult
  deleteWorkspace: DeleteWorkspaceResult
}

export function useWorkspace(initialData?: Workspace[]): UseWorkspaceReturn {
  const queryClient = useQueryClient()

  const getWorkspaces = useQuery({
    queryKey: WORKSPACES_KEY,
    queryFn: getWorkspacesClient,
    initialData: initialData && initialData.length > 0 ? initialData : undefined,
  })

  const createWorkspace = useMutation({
    mutationFn: (data: WorkspaceInsert) => createWorkspaceAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
    },
  })

  const updateWorkspace = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkspaceUpdate }) =>
      updateWorkspaceAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
    },
  })

  const deleteWorkspace = useMutation({
    mutationFn: (id: string) => deleteWorkspaceAction(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
      queryClient.removeQueries({ queryKey: ['documents', id] })
    },
  })

  return { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace }
}

/** Fetch a single workspace by id (internal/page-level use). */
export function useWorkspaceSingle(id: string) {
  return useQuery({
    queryKey: [...WORKSPACES_KEY, id],
    queryFn: () => getWorkspaceClient(id),
    enabled: !!id,
  })
}
