'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Settings, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebarCollapse } from './use-sidebar-collapse'
import { SidebarWorkspaceItem } from './sidebar-workspace-item'
import { useWorkspace } from '@/features/workspaces/hooks/use-workspace'
import type { Workspace } from '@/features/workspaces/types'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Workspaces', href: '/dashboard/workspaces', icon: LayoutDashboard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  initialWorkspaces?: Workspace[]
}

export function Sidebar({ initialWorkspaces = [] }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { isCollapsed, toggle } = useSidebarCollapse()

  const { getWorkspaces: { data: workspaces = initialWorkspaces } } = useWorkspace(initialWorkspaces)

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r overflow-hidden transition-all duration-200',
          'bg-sidebar text-sidebar-foreground border-sidebar-border',
          'md:relative md:translate-x-0 md:flex',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-16 w-60' : 'w-60'
        )}
      >
        {/* Header: Logo + Desktop collapse toggle */}
        <div className="flex h-14 items-center border-b border-sidebar-border shrink-0 px-3">
          {!isCollapsed && (
            <span className="flex-1 text-lg font-bold tracking-tight px-2">Orion</span>
          )}
          {isCollapsed && <span className="flex-1" />}

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 shrink-0"
            onClick={toggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Nav links + workspace items */}
        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
          {/* Static nav items */}
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href === '/dashboard/workspaces' && pathname === '/dashboard/workspaces')
            const linkClass = cn(
              'flex items-center rounded-md py-2 text-sm font-medium transition-colors',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )

            const linkContent = (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{label}</span>}
              </Link>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              )
            }

            return linkContent
          })}

          {/* Workspace section separator */}
          {workspaces.length > 0 && (
            <>
              {!isCollapsed && (
                <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Workspaces
                </p>
              )}
              {isCollapsed && <div className="border-t border-sidebar-border my-2" />}
              {workspaces.map((workspace) => (
                <SidebarWorkspaceItem
                  key={workspace.id}
                  workspace={workspace}
                  isCollapsed={isCollapsed}
                  onClose={() => setOpen(false)}
                />
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  )
}
