'use client'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useEffect, useMemo } from 'react'

import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'

const doc = new Y.Doc()

interface CollabEditorProps {
  userName?: string
  color?: string
}

export const CollabEditor = ({ userName = 'Anonymous', color = '#f97316' }: CollabEditorProps) => {
  // Use useMemo instead of useRef to avoid accessing ref during render
  const provider = useMemo(() => {
    return new HocuspocusProvider({
      url: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL ?? 'ws://localhost:1234',
      name: 'demo-document',
      document: doc,
    })
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCaret.configure({
        provider,
        user: { name: userName, color },
      }),
    ],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That's it. It's probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  })

  useEffect(() => {
    if (editor) {
      editor.commands.updateUser({ name: userName, color })
    }
  }, [editor, userName, color])

  useEffect(() => {
    return () => {
      provider.destroy()
    }
  }, [provider])

  return <EditorContent editor={editor} />
}
