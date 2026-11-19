import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { RoleContext } from './roleContext'
import type { Role } from './roles'
import { readStoredRole, writeStoredRole } from './roles'

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => readStoredRole())

  const setRole = useCallback((next: Role) => {
    writeStoredRole(next)
    setRoleState(next)
  }, [])

  const signOut = useCallback(() => {
    writeStoredRole('visitor')
    setRoleState('visitor')
  }, [])

  const value = useMemo(() => ({ role, setRole, signOut }), [role, setRole, signOut])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
