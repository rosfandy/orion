import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'
import type { Profile } from '@/features/profile/types'

interface ProfilePreviewProps {
  profile: Profile | null
  email: string
}

export function ProfilePreview({ profile, email }: ProfilePreviewProps) {
  const displayName = profile?.full_name ?? email.split('@')[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        {profile?.avatar_url ? (
          <div className="relative h-20 w-20 rounded-full overflow-hidden border">
            <Image
              src={profile.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border">
            <UserCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        <div className="space-y-1">
          <p className="font-semibold text-base leading-tight">{displayName}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        {profile?.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed border-t pt-4 w-full">
            {profile.bio}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
