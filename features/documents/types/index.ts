export interface Document {
  id: string
  workspace_id: string
  title: string
  content: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type DocumentInsert = {
  workspace_id: string
  title?: string
  content?: string | null
}

export type DocumentUpdate = Partial<Pick<Document, 'title' | 'content'>>
