'use client'

import { Extension, type ChainedCommands } from '@tiptap/core'
import Suggestion, { type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Command definitions
// ---------------------------------------------------------------------------

interface CommandItem {
  label: string
  description: string
  icon: React.ReactNode
  command: (chain: ChainedCommands) => ChainedCommands
  keywords: string[]
}

const COMMANDS: CommandItem[] = [
  {
    label: 'Text',
    description: 'Plain paragraph',
    icon: <Type className="h-4 w-4" />,
    command: (chain) => chain.setParagraph(),
    keywords: ['text', 'paragraph', 'p'],
  },
  {
    label: 'Heading 1',
    description: 'Large section heading',
    icon: <Heading1 className="h-4 w-4" />,
    command: (chain) => chain.setHeading({ level: 1 }),
    keywords: ['h1', 'heading1', 'heading 1', 'title'],
  },
  {
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: <Heading2 className="h-4 w-4" />,
    command: (chain) => chain.setHeading({ level: 2 }),
    keywords: ['h2', 'heading2', 'heading 2', 'subtitle'],
  },
  {
    label: 'Heading 3',
    description: 'Small section heading',
    icon: <Heading3 className="h-4 w-4" />,
    command: (chain) => chain.setHeading({ level: 3 }),
    keywords: ['h3', 'heading3', 'heading 3'],
  },
  {
    label: 'Bullet List',
    description: 'Unordered list',
    icon: <List className="h-4 w-4" />,
    command: (chain) => chain.toggleBulletList(),
    keywords: ['bullet', 'list', 'ul', 'unordered'],
  },
  {
    label: 'Numbered List',
    description: 'Ordered list',
    icon: <ListOrdered className="h-4 w-4" />,
    command: (chain) => chain.toggleOrderedList(),
    keywords: ['numbered', 'ordered', 'ol', 'list'],
  },
  {
    label: 'Task List',
    description: 'Checklist with checkboxes',
    icon: <CheckSquare className="h-4 w-4" />,
    command: (chain) => chain.toggleTaskList(),
    keywords: ['task', 'todo', 'check', 'checklist'],
  },
  {
    label: 'Blockquote',
    description: 'Highlighted quote block',
    icon: <Quote className="h-4 w-4" />,
    command: (chain) => chain.toggleBlockquote(),
    keywords: ['quote', 'blockquote', 'callout'],
  },
  {
    label: 'Code Block',
    description: 'Monospaced code block',
    icon: <Code2 className="h-4 w-4" />,
    command: (chain) => chain.toggleCodeBlock(),
    keywords: ['code', 'codeblock', 'pre', 'monospace'],
  },
  {
    label: 'Divider',
    description: 'Horizontal rule separator',
    icon: <Minus className="h-4 w-4" />,
    command: (chain) => chain.setHorizontalRule(),
    keywords: ['divider', 'hr', 'rule', 'separator', 'line'],
  },
]

function filterCommands(query: string): CommandItem[] {
  if (!query) return COMMANDS
  const q = query.toLowerCase()
  return COMMANDS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q)),
  )
}

// ---------------------------------------------------------------------------
// SlashMenuList React component (rendered via ReactRenderer)
// ---------------------------------------------------------------------------

interface SlashMenuListProps extends SuggestionProps {
  items: CommandItem[]
}

interface SlashMenuListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashMenuList = forwardRef<SlashMenuListRef, SlashMenuListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

    const selectItem = useCallback(
      (index: number) => {
        const item = props.items[index]
        if (item) {
          props.command(item as unknown as Record<string, unknown>)
        }
      },
      [props],
    )

    // Reset selection when items change
    useEffect(() => {
      setSelectedIndex(0)
    }, [props.items])

    // Scroll selected item into view
    useEffect(() => {
      const el = itemRefs.current[selectedIndex]
      el?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i - 1 + props.items.length) % props.items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % props.items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      },
    }))

    if (props.items.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-popover shadow-md p-2 w-64">
          <p className="text-xs text-muted-foreground px-2 py-1">No results</p>
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className="rounded-lg border border-border bg-popover shadow-md py-1 w-64 max-h-80 overflow-y-auto"
      >
        {props.items.map((item, index) => (
          <button
            key={item.label}
            ref={(el) => { itemRefs.current[index] = el }}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              selectItem(index)
            }}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
              'flex w-[calc(100%-8px)] mx-1 items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
              {item.icon}
            </span>
            <div className="flex flex-col items-start">
              <span className="font-medium leading-none">{item.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    )
  },
)

SlashMenuList.displayName = 'SlashMenuList'

// ---------------------------------------------------------------------------
// Tiptap Extension
// ---------------------------------------------------------------------------

const suggestionOptions: Omit<SuggestionOptions, 'editor'> = {
  char: '/',
  allowSpaces: false,

  items: ({ query }) => filterCommands(query),

  render: () => {
    let renderer: ReactRenderer<SlashMenuListRef> | null = null
    let tippyInstance: TippyInstance | null = null

    return {
      onStart(props) {
        renderer = new ReactRenderer(SlashMenuList, {
          props,
          editor: props.editor,
        })

        const { view } = props.editor
        tippyInstance = tippy(document.body, {
          getReferenceClientRect: () =>
            props.clientRect?.() ?? view.dom.getBoundingClientRect(),
          appendTo: () => document.body,
          content: renderer.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          arrow: false,
          theme: 'slash-menu',
          offset: [0, 4],
          zIndex: 9999,
          popperOptions: {
            modifiers: [
              { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
              { name: 'flip', options: { fallbackPlacements: ['top-start'] } },
            ],
          },
        })
      },

      onUpdate(props) {
        renderer?.updateProps(props)
        tippyInstance?.setProps({
          getReferenceClientRect: () =>
            props.clientRect?.() ?? props.editor.view.dom.getBoundingClientRect(),
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          tippyInstance?.hide()
          return true
        }
        return renderer?.ref?.onKeyDown(props) ?? false
      },

      onExit() {
        tippyInstance?.destroy()
        tippyInstance = null
        renderer?.destroy()
        renderer = null
      },
    }
  },

  command: ({ editor, range, props }) => {
    const item = props as unknown as CommandItem
    item.command(editor.chain().focus().deleteRange(range)).run()
  },
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: suggestionOptions,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
