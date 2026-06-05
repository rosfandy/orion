'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData, AuthResult } from '@/features/auth/types'

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function guestLoginUser(): Promise<AuthResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInAnonymously()

  if (error) {
    if (error.code === 'anonymous_provider_disabled') {
      return { error: 'Guest login is not enabled. Please sign in with an account.' }
    }
    return { error: 'Something went wrong. Please try again later.' }
  }

  return { success: true }
}

export async function loginUser(data: LoginFormData): Promise<AuthResult> {
  if (data.email.trim() === '') {
    return { error: 'Please enter your email address.' }
  }
  if (data.password.trim() === '') {
    return { error: 'Please enter your password.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    if (error.code === 'invalid_credentials') {
      return { error: 'Invalid email or password. Please try again.' }
    }
    return { error: 'Something went wrong. Please try again later.' }
  }

  return { success: true }
}

export async function registerUser(data: RegisterFormData): Promise<AuthResult> {
  if (data.email.trim() === '') {
    return { error: 'Please enter your email address.' }
  }
  if (data.password.trim() === '') {
    return { error: 'Please enter a password.' }
  }
  if (data.confirmPassword.trim() === '') {
    return { error: 'Please confirm your password.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) {
    if (error.code === 'user_already_exists') {
      return { error: 'An account with this email already exists. Try signing in instead.' }
    }
    if (error.code === 'weak_password') {
      return { error: 'Password must be at least 6 characters.' }
    }
    return { error: 'Something went wrong. Please try again later.' }
  }

  return { success: true }
}

export async function forgotPasswordUser(data: ForgotPasswordFormData): Promise<AuthResult> {
  if (data.email.trim() === '') {
    return { error: 'Please enter your email address.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    return { error: 'Something went wrong. Please try again later.' }
  }

  return { success: true }
}

export async function resetPasswordUser(data: ResetPasswordFormData): Promise<AuthResult> {
  if (data.password.trim() === '') {
    return { error: 'Please enter a new password.' }
  }
  if (data.confirmPassword.trim() === '') {
    return { error: 'Please confirm your new password.' }
  }
  if (data.password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }
  if (data.password !== data.confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: data.password,
  })

  if (error) {
    console.error('resetPasswordUser error:', error)
    if (error.code === 'weak_password') {
      return { error: 'Password must be at least 6 characters.' }
    }
    return { error: error.message ?? 'Something went wrong. Please try again later.' }
  }

  return { success: true }
}
