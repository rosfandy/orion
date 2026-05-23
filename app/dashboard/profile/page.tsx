import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/features/profile/services/profile-service'
import { ProfileForm } from '@/features/profile/components/profile-form'
import { ProfilePreview } from '@/features/profile/components/profile-preview'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userId = user.id
  const profile = await getProfile(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information and how others see you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} userId={userId} />
        </div>
        <div className="lg:col-span-1">
          <ProfilePreview profile={profile} email={user.email ?? ''} />
        </div>
      </div>
    </div>
  )
}
