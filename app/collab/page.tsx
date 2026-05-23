'use client'

/**
 * /collab — Collaborative editor demo page.
 *
 * Open this page in two browser tabs to see real-time collaboration in action.
 * Make sure the Hocuspocus server is running first:
 *
 *   npm run collab
 */

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CollabEditor } from '@/features/documents/components/collaborative-editor'

const DEMO_COLORS = [
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6',
]

export default function CollabDemoPage() {
  const [userName, setUserName] = useState('You')
  const [selectedColor, setSelectedColor] = useState(DEMO_COLORS[0])
  const [documentName] = useState('demo-document')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Collaborative Editor
          </h1>
          <p className="text-muted-foreground text-sm">
            Open this page in multiple tabs or browsers to see real-time
            collaboration. Make sure the Hocuspocus server is running (
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              npm run collab
            </code>
            ).
          </p>
        </div>

        {/* User settings */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-card-foreground">
            Your identity
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* Name */}
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="userName" className="text-xs">
                Display name
              </Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="h-8 text-sm"
              />
            </div>

            {/* Color picker */}
            <div className="space-y-1.5">
              <Label className="text-xs">Cursor color</Label>
              <div className="flex items-center gap-1.5">
                {DEMO_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      'h-6 w-6 rounded-full transition-transform',
                      selectedColor === c && 'ring-2 ring-offset-1 ring-foreground scale-110',
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Document info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Document:</span>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
            {documentName}
          </code>
          <span className="text-muted-foreground/50">·</span>
          <span>
            Server:{' '}
            <code className="font-mono">
              {process.env.NEXT_PUBLIC_HOCUSPOCUS_URL ?? 'ws://localhost:1234'}
            </code>
          </span>
        </div>

        {/* Editor */}
        <CollabEditor userName={userName} color={selectedColor} />
      </div>
    </div>
  )
}
