import type { SocialLinks } from '@/features/settings/types'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  social_links: SocialLinks | null
  updated_at: string
}

export type ProfileUpdate = Omit<Profile, 'id' | 'updated_at'>
