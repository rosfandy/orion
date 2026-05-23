'use client'

import { useEffect } from 'react'
import { useNavbarTitle } from './navbar-context'

export function NavbarTitleUpdater({ title }: { title: string }) {
  const { setTitle } = useNavbarTitle()
  useEffect(() => {
    setTitle(title)
    return () => setTitle('Dashboard')
  }, [title, setTitle])
  return null
}
