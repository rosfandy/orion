import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth/components/login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
