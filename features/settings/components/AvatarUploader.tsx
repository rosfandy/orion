'use client'

import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { uploadAvatar, removeAvatar } from '@/features/settings/services/settings-service'
import { Upload, Trash2 } from 'lucide-react'

interface AvatarUploaderProps {
  userId: string
  onUploaded: (url: string) => void
  onRemoved: () => void
  onPreview?: (previewUrl: string | null) => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export function AvatarUploader({ userId, onUploaded, onRemoved, onPreview }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fileError, setFileError] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only JPEG, PNG, or WebP images are allowed')
      return
    }
    if (file.size > MAX_SIZE) {
      setFileError('File must be under 2MB')
      return
    }
    setFileError('')

    // Revoke previous preview URL before creating a new one
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setPendingFile(file)
    onPreview?.(objectUrl)
  }

  async function handleUpload() {
    if (!pendingFile) return

    const formData = new FormData()
    formData.append('avatar', pendingFile)

    setUploading(true)
    const result = await uploadAvatar(userId, formData)
    setUploading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.url) {
      // Revoke the preview URL now that the real URL is available
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPendingFile(null)
      onPreview?.(null)
      onUploaded(result.url)
      toast.success('Avatar updated')
    }

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleSelectClick() {
    // Clear any previous pending selection
    setPendingFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      onPreview?.(null)
    }
    inputRef.current?.click()
  }

  async function handleRemove() {
    setUploading(true)
    const result = await removeAvatar(userId)
    setUploading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      onRemoved()
      toast.success('Avatar removed')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectClick}
          disabled={uploading}
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Choose photo
        </Button>
        {pendingFile && (
          <Button
            variant="default"
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleRemove} disabled={uploading}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Remove
        </Button>
      </div>
      {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      {pendingFile && !fileError && (
        <p className="text-xs text-muted-foreground">Preview ready — click Upload to save.</p>
      )}
      <p className="text-xs text-muted-foreground">JPEG, PNG or WebP · Max 2 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
