import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useRole } from '../../app/roleContext'
import type { Role } from '../../app/roles'

/**
 * REQ-AUTH-5 / WBS 9.1.3 — role-based access control.
 *
 * Genuinely enforced in the browser: a volunteer cannot open /admin. It is not
 * a security boundary, because there is no server (NFR-SEC-7 is recorded as
 * not applicable for this prototype).
 */
export function RequireRole({ allow }: { allow: Role[] }) {
  const { role } = useRole()
  const location = useLocation()

  if (!allow.includes(role)) {
    return <Navigate to="/login" replace state={{ from: location.pathname, needs: allow }} />
  }

  return <Outlet />
}
