import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export default async function ResetPasswordPage() {
  // The callback route already exchanged the code and set session cookies.
  // We just need to verify the user has a valid session before showing the form.
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/forgot-password?error=invalid_reset_link')
  }

  return <ResetPasswordForm />
}