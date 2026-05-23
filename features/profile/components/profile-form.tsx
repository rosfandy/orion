'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile } from '@/features/profile/services/profile-service'
import type { Profile, ProfileUpdate } from '@/features/profile/types'

interface ProfileFormProps {
  profile: Profile | null
  userId: string
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data: ProfileUpdate = {
      full_name: (formData.get('full_name') as string) || null,
      avatar_url: (formData.get('avatar_url') as string) || null,
      bio: (formData.get('bio') as string) || null,
      social_links: null,
    }

    startTransition(async () => {
      const result = await updateProfile(userId, data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile updated!')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              name="avatar_url"
              defaultValue={profile?.avatar_url ?? ''}
              placeholder="https://example.com/avatar.png"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio ?? ''}
              placeholder="Tell us a bit about yourself"
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
