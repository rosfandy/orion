'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { updateProfileSection } from '@/features/settings/services/settings-service'
import type { SocialLinks } from '@/features/settings/types'
import { cn } from '@/lib/utils'

const BIO_MAX = 300

interface ProfileSectionProps {
  userId: string
  bio: string
  socialLinks: SocialLinks
}

function isValidUrl(val: string): boolean {
  if (!val) return true
  try {
    new URL(val)
    return true
  } catch {
    return false
  }
}

export function ProfileSection({ userId, bio: initialBio, socialLinks: initialLinks }: ProfileSectionProps) {
  const router = useRouter()
  const [bio, setBio] = useState(initialBio)
  const [savingBio, setSavingBio] = useState(false)

  const [links, setLinks] = useState<SocialLinks>(initialLinks)
  const [linkErrors, setLinkErrors] = useState<Partial<SocialLinks>>({})
  const [savingLinks, setSavingLinks] = useState(false)

  const bioOverLimit = bio.length > BIO_MAX

  async function handleSaveBio() {
    if (bioOverLimit) return
    setSavingBio(true)
    const result = await updateProfileSection(userId, { bio })
    setSavingBio(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Bio saved')
      router.refresh()
    }
  }

  function validateLinks(): boolean {
    const errors: Partial<SocialLinks> = {}
    const fields = ['twitter', 'github', 'linkedin', 'website'] as const
    for (const field of fields) {
      const val = links[field] ?? ''
      if (val && !isValidUrl(val)) {
        errors[field] = 'Please enter a valid URL'
      }
    }
    setLinkErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSaveLinks() {
    if (!validateLinks()) return
    setSavingLinks(true)
    const result = await updateProfileSection(userId, {
      social_links: links as Record<string, string>,
    })
    setSavingLinks(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Social links saved')
      router.refresh()
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">My Profile</h2>
        <p className="text-sm text-muted-foreground">Update your bio and social links.</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Bio</h3>
        <div className="space-y-1">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others a little about yourself…"
            rows={4}
            className="resize-none"
          />
          <p className={cn('text-xs text-right', bioOverLimit ? 'text-destructive' : 'text-muted-foreground')}>
            {bio.length}/{BIO_MAX}
          </p>
        </div>
        <Button onClick={handleSaveBio} disabled={savingBio || bioOverLimit} size="sm">
          {savingBio ? 'Saving…' : 'Save Bio'}
        </Button>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Social Links</h3>
        <div className="grid gap-3">
          {(['twitter', 'github', 'linkedin', 'website'] as const).map((field) => (
            <div key={field} className="space-y-1">
              <Label htmlFor={`link-${field}`} className="capitalize">{field === 'twitter' ? 'Twitter / X' : field.charAt(0).toUpperCase() + field.slice(1)}</Label>
              <Input
                id={`link-${field}`}
                type="url"
                value={links[field] ?? ''}
                onChange={(e) => {
                  setLinks((prev) => ({ ...prev, [field]: e.target.value }))
                  if (linkErrors[field]) setLinkErrors((prev) => ({ ...prev, [field]: undefined }))
                }}
                placeholder={`https://${field === 'twitter' ? 'twitter.com/username' : field === 'github' ? 'github.com/username' : field === 'linkedin' ? 'linkedin.com/in/username' : 'yourwebsite.com'}`}
              />
              {linkErrors[field] && <p className="text-xs text-destructive">{linkErrors[field]}</p>}
            </div>
          ))}
        </div>
        <Button onClick={handleSaveLinks} disabled={savingLinks} size="sm">
          {savingLinks ? 'Saving…' : 'Save Links'}
        </Button>
      </section>
    </div>
  )
}
