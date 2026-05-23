'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { getDocumentsClient, getDocumentClient } from '@/features/documents/services/document-client-service'
import {
  createDocumentAction,
  updateDocumentAction,
} from '@/features/documents/services/document-service'
import type { Document, DocumentInsert, DocumentUpdate } from '@/features/documents/types'

type GetDocumentsResult = UseQueryResult<Document[], Error>
type CreateDocumentResult = UseMutationResult<
  Awaited<ReturnType<typeof createDocumentAction>>,
  Error,
  DocumentInsert
>
type UpdateDocumentResult = UseMutationResult<
  Awaited<ReturnType<typeof updateDocumentAction>>,
  Error,
  { id: string; data: DocumentUpdate }
>

type UseDocumentReturn = {
  getDocuments: GetDocumentsResult
  createDocument: CreateDocumentResult
  updateDocument: UpdateDocumentResult
}

export function useDocument(workspaceId?: string): UseDocumentReturn {
  const queryClient = useQueryClient()

  const getDocuments = useQuery({
    queryKey: ['documents', workspaceId],
    queryFn: () => getDocumentsClient(workspaceId!),
    enabled: !!workspaceId,
  })

  const createDocument = useMutation({
    mutationFn: (data: DocumentInsert) => createDocumentAction(data),
    onSuccess: (result) => {
      if (result.document) {
        queryClient.invalidateQueries({
          queryKey: ['documents', result.document.workspace_id],
        })
      }
    },
  })

  const updateDocument = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentUpdate }) =>
      updateDocumentAction(id, data),
    onSuccess: (result) => {
      if (result.document) {
        queryClient.invalidateQueries({
          queryKey: ['documents', result.document.workspace_id],
        })
        queryClient.invalidateQueries({
          queryKey: ['document', result.document.id],
        })
      }
    },
  })

  return { getDocuments, createDocument, updateDocument }
}

/** Fetch a single document by id (page-level use). */
export function useDocumentSingle(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocumentClient(id),
    enabled: !!id,
  })
}
