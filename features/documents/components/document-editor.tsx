'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useDocument } from '@/features/documents/hooks/use-document'
import type { Document } from '@/features/documents/types'
import { SlashCommand } from '@/features/documents/components/editor/slash-command'

interface DocumentEditorProps {
  document: Document
  workspaceId: string
  workspace: { name: string; icon: string | null }
}

export function DocumentEditor({ document, workspaceId, workspace }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef(title)

  const { updateDocument } = useDocument(workspaceId)
  const isPending = updateDocument.isPending

  useEffect(() => {
    titleRef.current = title
  }, [title])

  const save = useCallback(
    (newTitle: string, newContent: string) => {
      updateDocument.mutate(
        {
          id: document.id,
          data: {
            title: newTitle.trim() || 'Untitled',
            content: newContent,
          },
        },
        {
          onError: () => {
            toast.error('Failed to save document. Please try again.')
          },
        },
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [document.id],
  )

  function scheduleSave(newTitle: string, newContent: string) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => save(newTitle, newContent), 1500)
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Type / for commands…' }),
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      SlashCommand,
    ],
    content: document.content ?? '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[70vh] text-base leading-relaxed',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      scheduleSave(titleRef.current, ed.getHTML())
    },
  })

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    scheduleSave(e.target.value, editor?.getHTML() ?? '')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground border-b">
        <Link
          href="/dashboard/workspaces"
          className="hover:text-foreground transition-colors"
        >
          Workspaces
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <span>{workspace.icon ?? '📁'}</span>
          <span>{workspace.name}</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground truncate max-w-[200px]">{title || 'Untitled'}</span>

        {/* Auto-save status */}
        <span className="ml-auto text-xs text-muted-foreground">
          {isPending ? 'Saving…' : 'Saved'}
        </span>
      </div>

      {/* Content area */}
      <div className="max-w-2xl mx-auto w-full px-4 py-12 flex flex-col flex-1">
        {/* Title */}
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          aria-label="Document title"
          className="w-full bg-transparent text-5xl font-bold placeholder:text-muted-foreground/40 border-none outline-none ring-0 focus:ring-0 mb-6 leading-tight"
        />

        {/* Tiptap editor */}
        {editor ? (
          <EditorContent editor={editor} className="flex-1" />
        ) : null}
      </div>
    </div>
  )
}
