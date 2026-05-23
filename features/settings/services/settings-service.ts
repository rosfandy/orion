'use server'

import { createClient } from '@/lib/supabase/server'
import type { UserPreferences, FontSize } from '@/features/settings/types'

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      return null
    }

    return data as UserPreferences
  } catch {
    return null
  }
}

export async function upsertUserPreferences(
  userId: string,
  prefs: {
    language?: string
    timezone?: string
    date_format?: string
    font_size?: FontSize
  },
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('user_preferences').upsert(
      {
        user_id: userId,
        ...prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function updateAccountSettings(
  userId: string,
  fullName: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function updateEmail(newEmail: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function verifyCurrentPassword(
  email: string,
  currentPassword: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (error) return { error: 'Current password is incorrect' }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function uploadAvatar(
  userId: string,
  file: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const avatarFile = file.get('avatar') as File
    if (!avatarFile) return { error: 'No file provided' }

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(avatarFile.type)) {
      return { error: 'Only JPEG, PNG, or WebP images are allowed' }
    }
    if (avatarFile.size > 2 * 1024 * 1024) {
      return { error: 'File must be under 2 MB' }
    }

    const ext = avatarFile.name.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    const path = `${userId}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true })

    if (uploadError) return { error: uploadError.message }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = data.publicUrl

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })

    if (profileError) return { error: profileError.message }
    return { url: avatarUrl }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function removeAvatar(userId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function updateProfileSection(
  userId: string,
  data: { bio?: string | null; social_links?: Record<string, string> },
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function revokeOtherSessions(): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}
