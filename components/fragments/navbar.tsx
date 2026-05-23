'use client'

import { LogOut, UserCircle } from 'lucide-react'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { signOutAction } from '@/features/auth/service/auth-service'
import { useNavbarTitle } from './navbar-context'

interface NavbarProps {
  title?: string
  displayName: string
  avatarUrl?: string | null
}

export function Navbar({ title = 'Dashboard', displayName, avatarUrl }: NavbarProps) {
  const { title: contextTitle } = useNavbarTitle()
  const displayTitle = contextTitle ?? title

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6 shrink-0 border-border">
      {/* Left: page title */}
      <h1 className="text-sm font-semibold">{displayTitle}</h1>

      {/* Right: theme toggle + user menu */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User menu" className="rounded-full">
              {avatarUrl ? (
                <Avatar size="sm">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>
                    <UserCircle className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserCircle className="h-5 w-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOutAction()
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
