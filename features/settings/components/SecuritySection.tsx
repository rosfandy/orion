'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { revokeOtherSessions } from '@/features/settings/services/settings-service'
import { ShieldCheck, LogOut } from 'lucide-react'

export function SecuritySection() {
  const [revoking, setRevoking] = useState(false)

  async function handleRevoke() {
    setRevoking(true)
    const result = await revokeOtherSessions()
    setRevoking(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('All other sessions have been signed out')
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Security</h2>
        <p className="text-sm text-muted-foreground">Manage your account security and active sessions.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Active Sessions</h3>
        <div className="rounded-lg border p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Current session</p>
            <p className="text-xs text-muted-foreground">
              You are currently signed in. Session listing is not available via the client SDK.
              Use the button below to revoke all other active sessions.
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={revoking}>
              <LogOut className="h-4 w-4 mr-2" />
              {revoking ? 'Signing out…' : 'Sign out all other sessions'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out all other sessions?</AlertDialogTitle>
              <AlertDialogDescription>
                This will revoke all active sessions except your current one. You will need to sign
                in again on other devices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRevoke}>Sign out others</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}
