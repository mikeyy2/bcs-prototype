import { createContext, useContext } from 'react'
import type { MemberAccount, MutableState, NotificationPrefs, PartnerListing, Profile, StaffAccount } from './types'

export type RegisterResult =
  | { ok: true; registrationId: string }
  | { ok: false; reason: 'full' | 'already-registered' }

export type RsvpResult = { ok: true; rsvpId: string } | { ok: false; reason: 'full' | 'already-rsvped' }

export type DonateInput = {
  amountCents: number
  anonymous: boolean
  name: string
  email: string
}

export type InKindInput = {
  category: string
  description: string
  quantity: number
  condition: string
  photoName: string | null
  slotId: string | null
}

export type NewListingInput = {
  title: string
  kind: PartnerListing['kind']
  category: string
  dayOffset: number
  capacity: number
}

export type DataContextValue = {
  state: MutableState
  register: (opportunityId: string, shiftId: string) => RegisterResult
  cancelRegistration: (registrationId: string) => void
  rsvp: (eventId: string, guests: number) => RsvpResult
  cancelRsvp: (rsvpId: string) => void
  donate: (input: DonateInput) => { donationId: string; reference: string }
  submitInKind: (input: InKindInput) => { offerId: string }
  markAttendance: (registrationId: string, status: 'attended' | 'no-show') => void
  updateProfile: (profile: Partial<Profile>) => void
  setNotifications: (prefs: Partial<NotificationPrefs>) => void
  deleteAccount: () => void
  resetDemoData: () => void

  /** Staff console (WBS 7.1–7.4). */
  decideApproval: (itemId: string, decision: 'approved' | 'rejected', reason?: string) => void
  setAccountStatus: (accountId: string, status: MemberAccount['status']) => void
  setPartnerRevoked: (organizationId: string, revoked: boolean) => void
  addStaffAccount: (account: Omit<StaffAccount, 'id'>) => void
  setStaffActive: (staffId: string, active: boolean) => void

  /** Partner console (WBS 6.2–6.3). */
  createListing: (input: NewListingInput) => { listingId: string }
}

export const DataContext = createContext<DataContextValue | null>(null)

export function useData(): DataContextValue {
  const value = useContext(DataContext)
  if (!value) throw new Error('useData must be used inside <DataProvider>')
  return value
}
