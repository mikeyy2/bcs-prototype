/**
 * Mock authentication (REQ-AUTH-1…5, WBS 9.1.1–9.1.3).
 *
 * GitHub Pages is static, so there is no real login. C-02 carries a
 * "Prototype shortcut · Continue as" row, and that row is the whole auth
 * system: picking a role writes it to localStorage and the app treats the
 * visitor as that user class from then on.
 *
 * SRS §2.3 defines Visitor, Member, Partner, Staff, Driver and Administrator.
 * Driver and Administrator belong to the deferred services, so the prototype
 * models the four roles the Figma shortcut offers, plus Visitor.
 */
export type Role = 'visitor' | 'volunteer' | 'donor' | 'partner' | 'staff'

export const ROLE_STORAGE_KEY = 'bcs.role'

type RoleMeta = {
  label: string
  /** Where the Figma shortcut sends this role. */
  landing: string
  initials: string
}

export const ROLES: Record<Role, RoleMeta> = {
  visitor: { label: 'Visitor', landing: '/', initials: '' },
  volunteer: { label: 'Volunteer', landing: '/my-activity', initials: 'JD' },
  donor: { label: 'Donor', landing: '/my-activity', initials: 'JD' },
  partner: { label: 'Partner', landing: '/partner', initials: 'AF' },
  staff: { label: 'BCS Staff', landing: '/admin', initials: 'BS' },
}

/** Roles that count as a signed-in community member (SRS "Member"). */
export const MEMBER_ROLES: Role[] = ['volunteer', 'donor']

export function isSignedIn(role: Role): boolean {
  return role !== 'visitor'
}

export function readStoredRole(): Role {
  if (typeof localStorage === 'undefined') return 'visitor'
  const stored = localStorage.getItem(ROLE_STORAGE_KEY)
  return stored && stored in ROLES ? (stored as Role) : 'visitor'
}

export function writeStoredRole(role: Role): void {
  if (typeof localStorage === 'undefined') return
  if (role === 'visitor') localStorage.removeItem(ROLE_STORAGE_KEY)
  else localStorage.setItem(ROLE_STORAGE_KEY, role)
}
