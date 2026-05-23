import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export default async function ForgotPasswordPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()

  if (sessionData?.session) {
    redirect('/dashboard')
  }

  return <ForgotPasswordForm />
}