import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { storage } from '../lib/storage'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => storage.getToken())
  const [user, setUser] = useState<User | null>(() => storage.getUser())

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login: (nextToken, nextUser) => {
        storage.setToken(nextToken)
        storage.setUser(nextUser)
        setToken(nextToken)
        setUser(nextUser)
      },
      logout: () => {
        storage.clear()
        setToken(null)
        setUser(null)
      },
    }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
