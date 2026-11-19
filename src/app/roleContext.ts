import { createContext, useContext } from 'react'
import type { Role } from './roles'

export type RoleContextValue = {
  role: Role
  setRole: (role: Role) => void
  signOut: () => void
}

export const RoleContext = createContext<RoleContextValue | null>(null)

export function useRole(): RoleContextValue {
  const value = useContext(RoleContext)
  if (!value) throw new Error('useRole must be used inside <RoleProvider>')
  return value
}
