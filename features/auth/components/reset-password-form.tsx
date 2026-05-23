'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { resetPasswordUser } from '@/features/auth/service/auth-service'
import type { ResetPasswordFormData } from '@/features/auth/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password.trim() === '') {
      setError('Please enter a new password.')
      toast.error('Please enter a new password.')
      return
    }
    if (confirmPassword.trim() === '') {
      setError('Please confirm your new password.')
      toast.error('Please confirm your new password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      toast.error('Passwords do not match.')
      return
    }

    const data: ResetPasswordFormData = { password, confirmPassword }

    startTransition(async () => {
      const result = await resetPasswordUser(data)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else if (result?.success) {
        toast.success('Password updated! Redirecting…')
        // Hard navigation to ensure fresh session cookies are sent
        window.location.href = '/dashboard'
      }
    })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>
          Enter your new password below. Make sure it is at least 6 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                disabled={isPending}
                className="pr-10"
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                disabled={isPending}
                className="pr-10"
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                tabIndex={0}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <p id="password-error" role="alert" aria-atomic="true" aria-live="assertive" className="text-sm text-destructive min-h-[1.25rem]">
            {error ?? ''}
          </p>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}