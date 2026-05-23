'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface NavbarTitleContextValue {
  title: string | null
  setTitle: (title: string) => void
}

const NavbarTitleContext = createContext<NavbarTitleContextValue>({
  title: null,
  setTitle: () => {},
})

export function NavbarTitleProvider({
  children,
  defaultTitle = 'Dashboard',
}: {
  children: React.ReactNode
  defaultTitle?: string | null
}) {
  const [title, setTitleState] = useState<string | null>(defaultTitle ?? null)
  const setTitle = useCallback((t: string) => setTitleState(t), [])

  return (
    <NavbarTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </NavbarTitleContext.Provider>
  )
}

export function useNavbarTitle() {
  return useContext(NavbarTitleContext)
}
