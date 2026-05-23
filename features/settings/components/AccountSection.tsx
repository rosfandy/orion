'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUploader } from './AvatarUploader'
import {
  updateAccountSettings,
  updateEmail,
  updatePassword,
  verifyCurrentPassword,
} from '@/features/settings/services/settings-service'

interface AccountSectionProps {
  userId: string
  userEmail: string
  fullName: string
  avatarUrl: string | null
}

export function AccountSection({ userId, userEmail, fullName, avatarUrl }: AccountSectionProps) {
  const router = useRouter()
  const [name, setName] = useState(fullName)
  const [nameError, setNameError] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)

  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const initials = (name || userEmail)
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleSaveName() {
    if (!name.trim()) {
      setNameError('Display name is required')
      return
    }
    if (name.trim().length > 100) {
      setNameError('Max 100 characters')
      return
    }
    setNameError('')
    setSavingName(true)
    const result = await updateAccountSettings(userId, name.trim())
    setSavingName(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Display name updated')
      router.refresh()
    }
  }

  async function handleUpdateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newEmail.trim()) {
      setEmailError('Email is required')
      return
    }
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }
    setEmailError('')
    setSavingEmail(true)
    const result = await updateEmail(newEmail.trim())
    setSavingEmail(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Check your new email to confirm the change')
      setNewEmail('')
    }
  }

  async function handleChangePassword() {
    setPwError('')
    if (!currentPw || !newPw || !confirmPw) {
      setPwError('All fields are required')
      return
    }
    if (newPw.length < 8) {
      setPwError('Min 8 characters')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('Passwords do not match')
      return
    }
    setSavingPw(true)
    const verifyResult = await verifyCurrentPassword(userEmail, currentPw)
    if (verifyResult.error) {
      setSavingPw(false)
      setPwError('Current password is incorrect')
      return
    }
    const result = await updatePassword(newPw)
    setSavingPw(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Password updated successfully')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">My Account</h2>
        <p className="text-sm text-muted-foreground">Manage your display name, avatar, email and password.</p>
      </div>

      {/* Avatar + Display Name */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Profile Photo</h3>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={currentAvatar ?? undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <AvatarUploader
            userId={userId}
            onUploaded={(url) => {
              setCurrentAvatar(url)
              router.refresh()
            }}
            onRemoved={() => {
              setCurrentAvatar(null)
              router.refresh()
            }}
            onPreview={(previewUrl) => {
              setCurrentAvatar(previewUrl)
            }}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Display Name</h3>
        <div className="space-y-1">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError('')
            }}
            maxLength={101}
            placeholder="Your name"
          />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
        <Button onClick={handleSaveName} disabled={savingName} size="sm">
          {savingName ? 'Saving…' : 'Save name'}
        </Button>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Email Address</h3>
        <div className="space-y-1">
          <Label>Current email</Label>
          <Input value={userEmail} readOnly disabled className="bg-muted" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-email">New email</Label>
          <Input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value)
              if (emailError) setEmailError('')
            }}
            placeholder="new@example.com"
          />
          {emailError && <p className="text-xs text-destructive">{emailError}</p>}
        </div>
        <Button onClick={handleUpdateEmail} disabled={savingEmail} size="sm">
          {savingEmail ? 'Sending…' : 'Update Email'}
        </Button>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Change Password</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="current-pw">Current password</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-pw">New password</Label>
            <Input
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-pw">Confirm new password</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {pwError && <p className="text-xs text-destructive">{pwError}</p>}
        </div>
        <Button onClick={handleChangePassword} disabled={savingPw} size="sm">
          {savingPw ? 'Updating…' : 'Change Password'}
        </Button>
      </section>
    </div>
  )
}
