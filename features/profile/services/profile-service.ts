'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile, ProfileUpdate } from '@/features/profile/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // PGRST116 = no rows found
      if (error.code === 'PGRST116') return null
      return null
    }

    return data as Profile
  } catch {
    return null
  }
}

export async function updateProfile(
  userId: string,
  data: ProfileUpdate,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      if (error.code === '23503') {
        return { error: 'Profile could not be saved: user account not found.' }
      }
      if (error.code === '23514') {
        return { error: 'One or more field values are invalid. Please review your input.' }
      }
      if (error.code === 'PGRST301') {
        return { error: 'Your session has expired. Please sign in again.' }
      }
      return { error: `Failed to update profile: ${error.message}` }
    }

    return {}
  } catch {
    return { error: 'Something went wrong. Please try again later.' }
  }
}
