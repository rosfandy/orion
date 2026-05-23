'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { forgotPasswordUser } from '@/features/auth/service/auth-service'
import type { ForgotPasswordFormData } from '@/features/auth/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    if (email.trim() === '') {
      setError('Please enter your email address.')
      toast.error('Please enter your email address.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      toast.error('Please enter a valid email address.')
      return
    }

    const data: ForgotPasswordFormData = { email }

    startTransition(async () => {
      const result = await forgotPasswordUser(data)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else if (result?.success) {
        setSuccess(`Check your email — we've sent a password reset link to ${email}`)
        toast.success(`Password reset link sent to ${email}`)
      }
    })
  }

  if (success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Email sent</CardTitle>
          <CardDescription>{success}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => router.push('/auth/login')}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isPending}
              aria-describedby="email-error"
            />
          </div>

          <p id="email-error" role="alert" aria-atomic="true" aria-live="assertive" className="text-sm text-destructive min-h-[1.25rem]">
            {error ?? ''}
          </p>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Sending…' : 'Send reset email'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}