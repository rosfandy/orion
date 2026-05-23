export type FontSize = 'small' | 'default' | 'large'

export type SettingsSection =
  | 'account'
  | 'profile'
  | 'appearance'
  | 'language'
  | 'security'
  | 'workspace'

export interface SocialLinks {
  twitter?: string
  github?: string
  linkedin?: string
  website?: string
}

export interface UserPreferences {
  id: string
  user_id: string
  language: string
  timezone: string
  date_format: string
  font_size: FontSize
  updated_at: string
}

export interface AccountFormData {
  full_name: string
}

export interface PasswordFormData {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface AppearanceFormData {
  theme: 'light' | 'dark' | 'system'
  font_size: FontSize
}
